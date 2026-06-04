const express  = require('express');
const jsonServer = require('json-server');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── API: json-server montado en /api ─────────────────────────
const apiApp = jsonServer.create();
apiApp.use(jsonServer.defaults({ nolog: true }));
apiApp.use(jsonServer.router(path.join(__dirname, 'db.json')));
app.use('/api', apiApp);

// ── Frontend: archivos estáticos del build de Vite ───────────
app.use(express.static(path.join(__dirname, 'dist')));

// ── SPA fallback (React Router client-side routing) ──────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Tienda Pago Preventa corriendo en :${PORT}`);
});
