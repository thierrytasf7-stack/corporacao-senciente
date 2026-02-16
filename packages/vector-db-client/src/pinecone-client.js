class PineconeClient {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    // Initialize Pinecone client
    this.client = new Pinecone({
      apiKey: this.config.apiKey,
      environment: this.config.environment,
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

module.exports = PineconeClient;
