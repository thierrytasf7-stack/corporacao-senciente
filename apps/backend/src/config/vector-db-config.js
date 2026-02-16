module.exports = {
  vectorDB: process.env.VECTOR_DB || 'qdrant',
  qdrant: {
    host: process.env.QDRANT_HOST || 'localhost',
    port: process.env.QDRANT_PORT || 6333,
    apiKey: process.env.QDRANT_API_KEY || '',
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-east1-gcp',
  },
};
