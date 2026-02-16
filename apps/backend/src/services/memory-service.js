class MemoryService {
  constructor() {
    this.memory = new Map();
  }

  async storeMemory(key, data) {
    this.memory.set(key, data);
    return { success: true };
  }

  async retrieveMemory(key) {
    return this.memory.get(key);
  }

  async searchMemory(query) {
    const results = [];
    for (const [key, value] of this.memory.entries()) {
      if (JSON.stringify(value).includes(query)) {
        results.push({ key, value });
      }
    }
    return results;
  }
}

module.exports = MemoryService;
