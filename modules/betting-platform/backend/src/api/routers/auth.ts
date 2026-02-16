import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginRequest, LoginResponse, VerifyTokenRequest, VerifyTokenResponse } from '../types/auth';

const t = initTRPC.create();

const authRouter = t.router({
  login: t.procedure
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .query(async ({ input }) => {
      // Mock authentication for demo purposes
      const mockUsers = {
        admin: { password: '$2a$10$8K1p/a0dL2k5Z6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0a1b2c3d4e5f6g7h8i9j0k' }, // "password"
      };

      const user = mockUsers[input.username];
      
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        return {
          success: false,
          error: 'Invalid credentials',
        } as LoginResponse;
      }

      const token = jwt.sign(
        { username: input.username, role: 'admin' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return {
        success: true,
        data: {
          username: input.username,
          role: 'admin',
          token,
        },
        message: 'Login successful',
      } as LoginResponse;
    }),

  verify: t.procedure
    .input(z.object({
      token: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const decoded = jwt.verify(
          input.token,
          process.env.JWT_SECRET || 'fallback-secret'
        ) as { username: string; role: string };

        return {
          success: true,
          data: decoded,
          message: 'Token verified',
        } as VerifyTokenResponse;
      } catch (error) {
        return {
          success: false,
          error: 'Invalid or expired token',
        } as VerifyTokenResponse;
      }
    }),
});

export { authRouter };