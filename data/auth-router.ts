import { z } from 'zod';
import { router, publicProcedure } from './trpc';
import bcrypt from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { prisma } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const { email, password, firstName, lastName } = input;
      
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const passwordHash = await bcrypt.hash(password, 12);
      
      const user = await prisma.user.create({
        data: {
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          created_at: true,
        },
      });
      
      const accessToken = sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      
      await prisma.session.create({
        data: {
          user_id: user.id,
          refresh_token: refreshToken,
        },
      });
      
      return {
        success: true,
        message: 'Registration successful',
        user,
        accessToken,
        refreshToken,
      };
    }),
  
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const { email, password } = input;
      
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password_hash: true,
          first_name: true,
          last_name: true,
        },
      });
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordValid) {
        throw new Error('Invalid credentials');
      }
      
      const accessToken = sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      const refreshToken = sign(
        { userId: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      
      await prisma.session.create({
        data: {
          user_id: user.id,
          refresh_token: refreshToken,
        },
      });
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          last_login: new Date(),
        },
      });
      
      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        accessToken,
        refreshToken,
      };
    }),
  
  refresh: publicProcedure
    .input(z.object({
      refreshToken: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { refreshToken } = input;
      
      let decoded;
      try {
        decoded = verify(refreshToken, JWT_REFRESH_SECRET) as any;
      } catch {
        throw new Error('Invalid refresh token');
      }
      
      const session = await prisma.session.findUnique({
        where: {
          user_id_refresh_token: {
            user_id: decoded.userId,
            refresh_token: refreshToken,
          },
        },
      });
      
      if (!session) {
        throw new Error('Invalid refresh token');
      }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
        },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const accessToken = sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
      );
      
      return {
        success: true,
        accessToken,
      };
    }),
  
  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user) {
        await prisma.session.deleteMany({
          where: { user_id: ctx.user.id },
        });
      }
      
      return {
        success: true,
        message: 'Logout successful',
      };
    }),
  
  me: publicProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error('Unauthorized');
      }
      
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          created_at: true,
          last_login: true,
        },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        success: true,
        user,
      };
    }),
});