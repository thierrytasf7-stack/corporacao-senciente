import { totalBets, failedBets, activeConnections, cacheHitRate, betProcessingTime } from './metrics';

// Example usage in betting logic
export const placeBet = async (betData: any) => {
  const startTime = Date.now();
  
  try {
    // Increment active connections
    activeConnections.inc();
    
    // Place bet logic here...
    // Simulate bet processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Increment successful bet counter
    totalBets.inc();
    
    // Record processing time
    betProcessingTime.observe(Date.now() - startTime);
    
    return { success: true };
  } catch (error) {
    // Increment failed bet counter
    failedBets.inc();
    
    // Record processing time even on failure
    betProcessingTime.observe(Date.now() - startTime);
    
    throw error;
  } finally {
    // Decrement active connections
    activeConnections.dec();
  }
};

// Example usage in cache logic
export const updateCacheHitRate = (hits: number, totalRequests: number) => {
  if (totalRequests > 0) {
    const hitRate = (hits / totalRequests) * 100;
    cacheHitRate.set(hitRate);
  }
};