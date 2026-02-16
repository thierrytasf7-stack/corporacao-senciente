import { z } from 'zod';
import { router, publicProcedure } from './trpc';

export const usersRouter = router({
  getProfile: publicProcedure
    .query(() => {
      // TODO: Implement get user profile
      return {
        id: 'mock-user-id',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        bankroll: 1000.00,
        currency: 'USD',
        timezone: 'UTC',
      };
    }),
  
  updateProfile: publicProcedure
    .input(z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      timezone: z.string().optional(),
    }))
    .mutation(({ input }) => {
      // TODO: Implement update profile
      return {
        success: true,
        message: 'Profile updated successfully',
      };
    }),
});