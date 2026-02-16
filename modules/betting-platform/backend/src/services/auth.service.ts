import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export class AuthService {
  private static ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
  private static REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
  private static ACCESS_TOKEN_EXPIRES = '15m';
  private static REFRESH_TOKEN_EXPIRES = '7d';

  static async register(input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ userId: string }> {
    const { email, password, firstName, lastName } = input;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hash(password, 12);

    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
      select: { id: true },
    });

    return { userId: createdUser.id };
  }

  static async login(email: string, password: string): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const passwordValid = await compare(password, user.password);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  static async refresh(refreshToken: string): Promise<AuthTokens> {
    let decoded: DecodedToken;
    try {
      decoded = verify(refreshToken, this.REFRESH_TOKEN_SECRET) as DecodedToken;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.generateTokens(user.id);
  }

  static async logout(refreshToken: string): Promise<void> {
    // In a real implementation, you might want to store refresh tokens
    // in a database and invalidate them here. For now, we just verify
    // the token exists and is valid.
    try {
      verify(refreshToken, this.REFRESH_TOKEN_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private static generateTokens(userId: string): AuthTokens {
    const accessToken = sign(
      { userId },
      this.ACCESS_TOKEN_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken = sign(
      { userId },
      this.REFRESH_TOKEN_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): DecodedToken {
    return verify(token, this.ACCESS_TOKEN_SECRET) as DecodedToken;
  }

  static verifyRefreshToken(token: string): DecodedToken {
    return verify(token, this.REFRESH_TOKEN_SECRET) as DecodedToken;
  }
}