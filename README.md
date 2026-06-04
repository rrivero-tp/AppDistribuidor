# Tienda Pago · App de Preventas

Simulador PWA de la app móvil de preventas de Tienda Pago. Construido con React + Vite + TailwindCSS. Datos locales servidos con json-server.

## Instalación

```bash
npm install
npm run dev
```

- Vite (frontend): http://localhost:5173
- json-server (API): http://localhost:3001

## Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/cartera` | Cartera de clientes (pantalla principal) |
| `/cartera/:id` | Detalle de un cliente |
| `/cartera/agregar` | Agregar nuevo cliente |
| `/pedidos` | Lista de pedidos (todos / borradores / confirmados) |
| `/pedidos/nuevo` | Crear nuevo pedido |
| `/pedidos/:id` | Detalle de un pedido |
| `/referir` | Referir bodega para crédito |
| `/beneficios` | Score y lista de beneficios |
| `/beneficios/:id` | Detalle de un beneficio |
| `/beneficios/cupones` | Mis cupones y asignación |
| `/credito` | Mi crédito personal |
| `/onboarding/welcome` | Bienvenida (onboarding) |
| `/onboarding/otp` | Verificación de teléfono |
| `/onboarding/dni` | Verificación de documento |
| `/onboarding/tipo` | Tipo de preventa |
| `/onboarding/jerarquia` | Jerarquía de marca |
| `/onboarding/activacion` | Activación de cuenta |

## Panel de demo

En modo desarrollo (npm run dev), toca el ícono ⚗ en la barra superior para:
- Cambiar entre tipo Aliado / Independiente
- Ajustar el Trust Score en tiempo real con un slider
- Navegar directamente a estados específicos (mora, preaprobado, evaluación)
- Simular modo offline
- Recargar los datos de db.json

## Datos de prueba (db.json)

| Cliente | Estado |
|---------|--------|
| Bodega Flores (Rosa Flores) | En mora |
| Minimarket Los Pinos (Luis Paredes) | Por vencer |
| Bodega Don Héctor (Héctor Mamani) | Al día |
| Bodega Santa Rosa (María Quispe) | Preaprobado |
| Minimarket El Sol (Carlos Ríos) | Rechazado |
| Bodega La Esperanza (Jorge Salas) | En evaluación |
| Tienda Don Manuel (Manuel Torres) | Sin crédito |
| Minimarket Rápido (Ana Gutiérrez) | Sin crédito |

## Tecnologías

- **React 18** + React Router v6
- **Vite 5** (bundler y dev server)
- **TailwindCSS 3** (utilidades de estilo)
- **json-server 0.17** (API REST local sobre db.json)
- **lucide-react** (íconos)
- **concurrently** (correr Vite + json-server en paralelo)
- **DM Sans / Syne / DM Mono** (Google Fonts)
