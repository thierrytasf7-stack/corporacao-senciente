export class BetLockManager {
  private locks = new Map<string, number>();
  
  async acquireLock(userId: string, eventId: string): Promise<boolean> {
    const key = `${userId}:${eventId}`;
    if (this.locks.has(key)) return false;
    this.locks.set(key, Date.now());
    setTimeout(() => this.locks.delete(key), 5000); // TTL 5s
    return true;
  }
  
  releaseLock(userId: string, eventId: string) {
    this.locks.delete(`${userId}:${eventId}`);
  }
}