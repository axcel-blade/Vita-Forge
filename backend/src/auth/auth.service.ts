import {
  ConflictException,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { DATA_STORE, DataStore, SessionMeta, SessionRecord, StoredUserRecord } from '../repositories/data-store';
import { MemoryDataStore } from '../repositories/memory-data-store';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
}

export interface AuthTokenResponse {
  message: string;
  userId: string;
  access_token: string;
  refresh_token: string;
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
  isCurrent: boolean;
}

interface TokenPayload {
  sub: string;
  email: string;
  typ: 'access' | 'refresh';
  sid?: string;
}

interface ResolvedAuth {
  user: StoredUser;
  sessionId?: string;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret =
    process.env.JWT_SECRET || 'vita-forge-secret-key-change-in-production';
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
  ): Promise<AuthTokenResponse> {
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
    return this.issueTokens(this.toStoredUser(user), session.id, 'Registration successful');
  }

  async login(
    loginData: { email: string; password: string },
    meta: SessionMeta = {},
  ): Promise<AuthTokenResponse> {
    const user = await this.store.findUserByEmail(loginData.email);

    if (!user || !(await bcrypt.compare(loginData.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.store.createSession(user.id, meta);
    return this.issueTokens(this.toStoredUser(user), session.id, 'Login successful');
  }

  async refresh(refreshToken?: string): Promise<AuthTokenResponse> {
    const { user, sessionId } = await this.resolveUser(refreshToken, 'refresh');
    if (sessionId) {
      await this.store.touchSession(sessionId);
    }
    return this.issueTokens(user, sessionId, 'Token refreshed');
  }

  async getMe(authorization?: string): Promise<CurrentUserResponse> {
    const { user } = await this.resolveUser(this.extractBearerToken(authorization), 'access');
    return {
      id: user.id,
      email: user.email,
      name: user.name || 'Demo User',
      avatar: null,
      bio: '',
      skills: [],
    };
  }

  async logout(authorization?: string): Promise<void> {
    const { user, sessionId } = await this.resolveUser(this.extractBearerToken(authorization), 'access');
    if (sessionId) {
      await this.store.revokeSession(user.id, sessionId);
    }
  }

  async listSessions(authorization?: string): Promise<SessionResponse[]> {
    const { user, sessionId } = await this.resolveUser(this.extractBearerToken(authorization), 'access');
    const sessions = await this.store.listActiveSessions(user.id);
    return sessions.map((session) => this.toSessionResponse(session, sessionId));
  }

  async revokeSession(authorization: string | undefined, sessionId: string): Promise<void> {
    const { user } = await this.resolveUser(this.extractBearerToken(authorization), 'access');
    const revoked = await this.store.revokeSession(user.id, sessionId);
    if (!revoked) {
      throw new UnauthorizedException('Session not found');
    }
  }

  async updateAccount(
    authorization: string | undefined,
    patch: { name?: string; email?: string },
  ): Promise<CurrentUserResponse> {
    const { user } = await this.resolveUser(this.extractBearerToken(authorization), 'access');

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
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name || 'Demo User',
      avatar: null,
      bio: '',
      skills: [],
    };
  }

  async changePassword(
    authorization: string | undefined,
    body: { currentPassword: string; newPassword: string },
  ): Promise<void> {
    const { user, sessionId } = await this.resolveUser(this.extractBearerToken(authorization), 'access');

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
      sessions.filter((session) => session.id !== sessionId).map((session) => this.store.revokeSession(user.id, session.id)),
    );
  }

  private issueTokens(user: StoredUser, sessionId: string | undefined, message: string): AuthTokenResponse {
    return {
      message,
      userId: user.id,
      access_token: this.signToken(user, 'access', sessionId),
      refresh_token: this.signToken(user, 'refresh', sessionId),
    };
  }

  private async resolveUser(token: string | undefined, expectedType: TokenPayload['typ']): Promise<ResolvedAuth> {
    if (!token) {
      throw new UnauthorizedException(expectedType === 'refresh' ? 'Missing refresh token' : 'Missing token');
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret) as TokenPayload;
      if (payload.typ && payload.typ !== expectedType) {
        throw new UnauthorizedException('Invalid token');
      }

      const record =
        (await this.store.findUserByEmail(payload.email)) ?? (await this.store.findUserById(payload.sub));

      if (!record) {
        throw new UnauthorizedException('User not found');
      }

      // Tokens issued before session tracking have no `sid` — accept them without a session check.
      if (payload.sid) {
        const session = await this.store.getSession(payload.sid);
        if (!session || session.revokedAt || session.userId !== record.id) {
          throw new UnauthorizedException('Session revoked');
        }
      }

      return { user: this.toStoredUser(record), sessionId: payload.sid };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(expectedType === 'refresh' ? 'Invalid refresh token' : 'Invalid token');
    }
  }

  private signToken(user: StoredUser, typ: TokenPayload['typ'], sessionId?: string): string {
    return jwt.sign({ sub: user.id, email: user.email, typ, sid: sessionId }, this.jwtSecret, {
      expiresIn: typ === 'access' ? '15m' : '7d',
    });
  }

  private extractBearerToken(authorization?: string): string | undefined {
    if (!authorization) {
      return undefined;
    }
    return authorization.startsWith('Bearer ') ? authorization.slice(7) : authorization;
  }

  private toStoredUser(user: StoredUserRecord): StoredUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.passwordHash,
    };
  }

  private toSessionResponse(session: SessionRecord, currentSessionId?: string): SessionResponse {
    return {
      id: session.id,
      userAgent: session.userAgent,
      ip: session.ip,
      createdAt: session.createdAt.toISOString(),
      lastUsedAt: session.lastUsedAt.toISOString(),
      isCurrent: session.id === currentSessionId,
    };
  }
}
