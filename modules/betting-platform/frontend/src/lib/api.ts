import { apiClient } from './trpc'';

export const api = {
  health: () => apiClient.health.query(),
  // Add more API methods here
};