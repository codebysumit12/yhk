import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3002;

app.use(cors());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

// Proxy ALL /api requests to backend — preserves FormData, files, headers
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5001/api', // Include /api in target
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(`📡 Proxying ${req.method} ${req.url} to backend`);
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    proxyRes: (proxyRes, req, res) => {
      console.log(`✅ Backend response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
    error: (err, req, res) => {
      console.error('❌ Proxy error:', err);
      console.error('❌ Proxy error message:', err.message);
      console.error('❌ Full error:', JSON.stringify(err, null, 2));
      res.status(500).json({ success: false, message: 'Proxy error: ' + err.message });
    }
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 Proxy running on http://localhost:${PORT}`);
  console.log(`📡 Proxying /api/* to http://localhost:5001`);
});
