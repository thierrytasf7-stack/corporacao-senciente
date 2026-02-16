import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Test Server is running!', version: '1.0.0' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test Server running on port ${PORT}`);
  console.log(`📊 Health check available at /health`);
});
