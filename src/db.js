// En desarrollo apunta al json-server local; en producción usa /api (mismo origen)
const BASE = import.meta.env.DEV ? 'http://localhost:3001' : '/api';

export const db = {
  get: (resource) =>
    fetch(`${BASE}/${resource}`).then(r => r.ok ? r.json() : null),

  getOne: (resource, id) =>
    fetch(`${BASE}/${resource}/${id}`).then(r => r.ok ? r.json() : null),

  post: (resource, data) =>
    fetch(`${BASE}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  patch: (resource, id, data) =>
    fetch(`${BASE}/${resource}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // For singleton resources (session)
  patchSingleton: (resource, data) =>
    fetch(`${BASE}/${resource}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  put: (resource, data) =>
    fetch(`${BASE}/${resource}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (resource, id) =>
    fetch(`${BASE}/${resource}/${id}`, { method: 'DELETE' }),

  query: (resource, params) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${BASE}/${resource}?${qs}`).then(r => r.ok ? r.json() : []);
  },
};
