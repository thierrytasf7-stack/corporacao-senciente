class QdrantClient {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    // Initialize Qdrant client
    this.client = new Qdrant({
      host: this.config.host,
      port: this.config.port,
      apiKey: this.config.apiKey,
    });
  }

  async upsert(payload) {
    return this.client.upsert(payload);
  }

  async get(id) {
    return this.client.get(id);
  }

  async search(searchParams) {
    return this.client.search(searchParams);
  }
}

module.exports = QdrantClient;
