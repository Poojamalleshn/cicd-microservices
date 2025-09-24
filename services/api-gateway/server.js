import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Targets (Docker DNS names or full URLs)
const USERS_URL    = process.env.USERS_URL    || 'http://users:3001';
const PRODUCTS_URL = process.env.PRODUCTS_URL || 'http://products:3002';
const ORDERS_URL   = process.env.ORDERS_URL   || 'http://orders:3003';
const PAYMENTS_URL = process.env.PAYMENTS_URL || 'http://payments:3004';

// Base paths exposed by each service
const USERS_BASE    = process.env.USERS_BASE    || '/users';
const PRODUCTS_BASE = process.env.PRODUCTS_BASE || '/products';
const ORDERS_BASE   = process.env.ORDERS_BASE   || '/orders';
const PAYMENTS_BASE = process.env.PAYMENTS_BASE || '/payments';

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/health', (_req, res) => res.json({
  ok: true, service: 'api-gateway',
  targets: { USERS_URL, PRODUCTS_URL, ORDERS_URL, PAYMENTS_URL },
  bases:   { USERS_BASE, PRODUCTS_BASE, ORDERS_BASE, PAYMENTS_BASE }
}));

function joinPath(base, sub) {
  const a = String(base || '').replace(/\/+$/,''); // rm trailing /
  const b = String(sub || '').replace(/^\/+/,'');  // rm leading /
  return b ? `${a}/${b}` : `${a}`;
}
const errorJson = (svc) => (err, _req, res) => {
  console.error(`[proxy-error] ${svc}:`, err?.code || err?.message);
  if (!res.headersSent) res.status(504).json({ error: 'upstream_unreachable', service: svc, message: err?.message || 'proxy error' });
};

function proxyFor(svc, target, base) {
  return createProxyMiddleware({
    target, changeOrigin: true,
    proxyTimeout: 8000, timeout: 8000,
    pathRewrite: (p) => { const r = joinPath(base, p); console.log(`[rewrite] ${svc}: ${p} -> ${r}`); return r; },
    onError: errorJson(svc), logLevel: 'debug'
  });
}

app.use('/api/users',    proxyFor('users',    USERS_URL,    USERS_BASE));
app.use('/api/products', proxyFor('products', PRODUCTS_URL, PRODUCTS_BASE));
app.use('/api/orders',   proxyFor('orders',   ORDERS_URL,   ORDERS_BASE));
app.use('/api/payments', proxyFor('payments', PAYMENTS_URL, PAYMENTS_BASE));

app.listen(PORT, () => console.log(`api-gateway on ${PORT}`));