import {
  ConflictException,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DATA_STORE, DataStore, SessionMeta, SessionRecord, StoredUserRecord } from '../repositories/data-store';
import { MemoryDataStore } from '../repositories/memory-data-store';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
}

export interface AuthResult {
  message: string;
  userId: string;
  sessionId: string;
  csrfToken: string;
  expiresAt: string;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  bio: string;
  skills: string[];
}

export interface SessionResponse {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

interface ResolvedSession {
  user: StoredUser;
  sessionId: string;
}

@Injectable()
export class AuthService {
  private readonly store: DataStore;

  /**
   * Nest injects the shared DataStore when PrismaModule is loaded.
   * Specs construct AuthService directly and fall back to an isolated memory store.
   */
  constructor(@Optional() @Inject(DATA_STORE) store?: DataStore) {
    this.store = store ?? new MemoryDataStore();
  }

  async register(
    userData: { email: string; password: string; name?: string },
    meta: SessionMeta = {},
  ): Promise<AuthResult> {
    const { email, password, name = '' } = userData;
    const existing = await this.store.findUserByEmail(email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.store.createUser({
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: await bcrypt.hash(password, 10),
    });

    const session = await this.store.createSession(user.id, meta);
    return this.buildAuthResult(session, 'Registration successful');
  }

  async login(
    loginData: { email: string; password: string },
    meta: SessionMeta = {},
  ): Promise<AuthResult> {
    const user = await this.store.findUserByEmail(loginData.email);

    if (!user || !(await bcrypt.compare(loginData.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Always mint a brand-new session on successful login (session-fixation prevention) —
    // never reuse or upgrade a pre-existing/anonymous session id.
    const session = await this.store.createSession(user.id, meta);
    return this.buildAuthResult(session, 'Login successful');
  }

  async getMe(sessionId?: string): Promise<CurrentUserResponse> {
    const { user } = await this.resolveSession(sessionId);
    return this.toCurrentUser(user);
  }

  async logout(sessionId?: string): Promise<void> {
    if (!sessionId) {
      return;
    }
    const session = await this.store.getSession(sessionId);
    if (session && !session.revokedAt) {
      await this.store.revokeSession(session.userId, sessionId);
    }
  }

  async listSessions(sessionId?: string): Promise<SessionResponse[]> {
    const { user, sessionId: currentSessionId } = await this.resolveSession(sessionId);
    const sessions = await this.store.listActiveSessions(user.id);
    return sessions.map((session) => this.toSessionResponse(session, currentSessionId));
  }

  async revokeSession(sessionId: string | undefined, targetSessionId: string): Promise<void> {
    const { user } = await this.resolveSession(sessionId);
    const revoked = await this.store.revokeSession(user.id, targetSessionId);
    if (!revoked) {
      throw new UnauthorizedException('Session not found');
    }
  }

  async updateAccount(
    sessionId: string | undefined,
    patch: { name?: string; email?: string },
  ): Promise<CurrentUserResponse> {
    const { user } = await this.resolveSession(sessionId);

    if (patch.email && patch.email !== user.email) {
      const existing = await this.store.findUserByEmail(patch.email);
      if (existing && existing.id !== user.id) {
        throw new ConflictException('Email is already in use');
      }
    }

    const updatePayload: Partial<Pick<StoredUserRecord, 'name' | 'email'>> = {};
    if (patch.name !== undefined) {
      updatePayload.name = patch.name;
    }
    if (patch.email !== undefined) {
      updatePayload.email = patch.email;
    }

    const updated = await this.store.updateUser(user.id, updatePayload);
    return this.toCurrentUser(this.toStoredUser(updated));
  }

  async changePassword(
    sessionId: string | undefined,
    body: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    const { user, sessionId: currentSessionId } = await this.resolveSession(sessionId);

    // `user.password` holds the stored hash (see toStoredUser).
    const valid = await bcrypt.compare(body.currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await this.store.updateUser(user.id, { passwordHash });

    // Changing the password is a security-sensitive action — sign out every other device.
    const sessions = await this.store.listActiveSessions(user.id);
    await Promise.all(
      sessions
        .filter((session) => session.id !== currentSessionId)
        .map((session) => this.store.revokeSession(user.id, session.id)),
    );
  }

  /**
   * Validates a session cookie value against the backend store, rejecting missing, unknown,
   * revoked, or expired sessions, and slides the 30-day inactivity window forward on success.
   */
  async resolveSession(sessionId?: string): Promise<ResolvedSession> {
    if (!sessionId) {
      throw new UnauthorizedException('Missing session');
    }

    const session = await this.store.getSession(sessionId);
    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    const record = await this.store.findUserById(session.userId);
    if (!record) {
      throw new UnauthorizedException('User not found');
    }

    await this.store.touchSession(sessionId);
    return { user: this.toStoredUser(record), sessionId };
  }

  private buildAuthResult(session: SessionRecord, message: string): AuthResult {
    return {
      message,
      userId: session.userId,
      sessionId: session.id,
      // Double-submit CSRF token: unrelated to the session id, only ever compared to itself.
      csrfToken: crypto.randomBytes(32).toString('hex'),
      expiresAt: session.expiresAt.toISOString(),
    };
  }

  private toStoredUser(user: StoredUserRecord): StoredUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.passwordHash,
    };
  }

  private toCurrentUser(user: StoredUser): CurrentUserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name || 'Demo User',
      avatar: null,
      bio: '',
      skills: [],
    };
  }

  private toSessionResponse(session: SessionRecord, currentSessionId?: string): SessionResponse {
    return {
      id: session.id,
      userAgent: session.userAgent,
      ip: session.ip,
      createdAt: session.createdAt.toISOString(),
      lastUsedAt: session.lastUsedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      isCurrent: session.id === currentSessionId,
    };
  }
}
