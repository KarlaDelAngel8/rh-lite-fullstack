import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../config/env.js';

export const apiProxy = createProxyMiddleware({
  target: env.upstreamApiUrl,
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/api': '',
  },
  onError(error, _req, res) {
    res.status(502).json({
      message: 'Error connecting to upstream API.',
      detail: error.message,
    });
  },
});
