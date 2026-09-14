# FinZen - Web UI (Next.js)

Frontend de **FinZen** (App Router + TypeScript + Tailwind CSS) que consume el
backend de 4 microservicios FastAPI.

## Arquitectura de comunicación (BFF)

El navegador **no** llama directamente a los microservicios. Todas las peticiones
pasan por el backend-for-frontend de Next.js:

```
Navegador → /api/backend/{service}/{ruta} → microservicio FastAPI
```

- El token JWT se guarda en una **cookie `httpOnly`** (`finzen_token`), inaccesible
  desde JavaScript.
- El Route Handler `src/app/api/backend/[...path]/route.ts` lee esa cookie y añade
  `Authorization: Bearer <token>` al reenviar la petición.
- `middleware.ts` protege las rutas privadas y redirige a `/login` si no hay sesión.

## Vistas

| Ruta | Descripción |
|---|---|
| `/` | Bienvenida |
| `/login`, `/registro` | Autenticación |
| `/dashboard` | Balance, gráfico de gastos por categoría y accesos directos |
| `/ingresos`, `/ingresos/nuevo`, `/ingresos/[id]` | Ingresos |
| `/gastos`, `/gastos/nuevo`, `/gastos/[id]` | Gastos (con filtros) |
| `/perfil` | Edición de perfil |
| `/asistente` | Chat de consulta inteligente (IA) |

## Ejecutar en local

1. Levanta el backend (en `finzen-app`): `./scripts/start_local.sh`
2. Copia variables de entorno: `cp .env.local.example .env.local`
3. Instala y arranca:

```bash
npm install
npm run dev      # http://localhost:3000
```

## Ejecutar con Docker

Con el backend dockerizado (`finzen-app`, red `finzen-app_backend-net`):

```bash
docker build -t finzen-webui .
docker run -d --name finzen-webui --network finzen-app_backend-net -p 3000:3000 \
  -e USER_API_URL=http://nginx/api/users \
  -e INCOME_API_URL=http://nginx/api/incomes \
  -e EXPENSE_API_URL=http://nginx/api/expenses \
  -e AI_API_URL=http://nginx/api/ai \
  finzen-webui
```

Luego abrir `http://localhost:3000`.

> Nota (Mac Apple Silicon): las imágenes construidas localmente son ARM. Para EC2
> (x86) hay que construir con `--platform linux/amd64` o construir dentro de la instancia.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `USER_API_URL` | URL del user-service (por defecto `http://localhost:8001`) |
| `INCOME_API_URL` | URL del income-service (`http://localhost:8002`) |
| `EXPENSE_API_URL` | URL del expense-service (`http://localhost:8003`) |
| `AI_API_URL` | URL del ai-service (`http://localhost:8004`) |

> Son variables **de servidor** (sin prefijo `NEXT_PUBLIC_`): solo las usa el BFF,
> nunca se exponen al navegador.
