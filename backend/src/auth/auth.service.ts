import { ConflictException, Inject, Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { DATA_STORE, DataStore, StoredUserRecord } from '../repositories/data-store';
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

interface TokenPayload {
  sub: string;
  email: string;
  typ: 'access' | 'refresh';
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

  async register(userData: { email: string; password: string; name?: string }): Promise<AuthTokenResponse> {
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

    return this.issueTokens(this.toStoredUser(user), 'Registration successful');
  }

  async login(loginData: { email: string; password: string }): Promise<AuthTokenResponse> {
    const user = await this.store.findUserByEmail(loginData.email);

    if (!user || !(await bcrypt.compare(loginData.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(this.toStoredUser(user), 'Login successful');
  }

  async refresh(refreshToken?: string): Promise<AuthTokenResponse> {
    const user = await this.resolveUser(refreshToken, 'refresh');
    return this.issueTokens(user, 'Token refreshed');
  }

  async getMe(authorization?: string): Promise<CurrentUserResponse> {
    const user = await this.resolveUser(this.extractBearerToken(authorization), 'access');
    return {
      id: user.id,
      email: user.email,
      name: user.name || 'Demo User',
      avatar: null,
      bio: '',
      skills: [],
    };
  }

  private issueTokens(user: StoredUser, message: string): AuthTokenResponse {
    return {
      message,
      userId: user.id,
      access_token: this.signToken(user, 'access'),
      refresh_token: this.signToken(user, 'refresh'),
    };
  }

  private async resolveUser(token: string | undefined, expectedType: TokenPayload['typ']): Promise<StoredUser> {
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

      return this.toStoredUser(record);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(expectedType === 'refresh' ? 'Invalid refresh token' : 'Invalid token');
    }
  }

  private signToken(user: StoredUser, typ: TokenPayload['typ']): string {
    return jwt.sign({ sub: user.id, email: user.email, typ }, this.jwtSecret, {
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
}
