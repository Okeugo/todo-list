import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const FASTAPI_PORT = 8000;
const isProd = process.env.NODE_ENV === 'production';

let pythonProc: ChildProcess | null = null;

// Start Python FastAPI backend
function startFastApi() {
  const backendScript = path.join(__dirname, 'backend', 'main.py');
  console.log(`[Backend] Starting FastAPI server on port ${FASTAPI_PORT}...`);

  pythonProc = spawn('python3', [backendScript], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  pythonProc.on('error', (err) => {
    console.error('[Backend] Failed to start Python FastAPI process:', err);
  });

  pythonProc.on('exit', (code, signal) => {
    console.log(`[Backend] Python FastAPI exited with code ${code}, signal ${signal}`);
  });
}

// Clean up child process on exit
function cleanup() {
  if (pythonProc) {
    console.log('[Backend] Stopping FastAPI server...');
    pythonProc.kill('SIGTERM');
    pythonProc = null;
  }
}

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

async function createServer() {
  startFastApi();

  const app = express();

  // Proxy API and FastAPI documentation requests to FastAPI on port 8000
  const fastApiProxy = createProxyMiddleware({
    target: `http://127.0.0.1:${FASTAPI_PORT}`,
    changeOrigin: true,
    on: {
      error: (err, _req, res) => {
        console.error('[Proxy Error] Could not connect to FastAPI:', err.message);
        if (res && 'writeHead' in res && typeof res.writeHead === 'function') {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'FastAPI backend is starting up or unavailable. Please retry in a few seconds.',
            detail: err.message
          }));
        }
      }
    }
  });

  app.use(['/api', '/docs', '/openapi.json'], fastApiProxy);

  if (!isProd) {
    // Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 App running at http://0.0.0.0:${PORT}`);
    console.log(`⚡ FastAPI backend proxied at http://0.0.0.0:${PORT}/api`);
    console.log(`📖 FastAPI Swagger Docs available at http://0.0.0.0:${PORT}/docs`);
  });
}

createServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  cleanup();
  process.exit(1);
});
