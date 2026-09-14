# FinZen — Web UI (Next.js)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node](https://img.shields.io/badge/Node-20--alpine-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Nota de arquitectura:** este repositorio contiene el **frontend** de FinZen.
> El backend (4 microservicios FastAPI) vive en
> **[finzen-app](https://github.com/UTEC-AII/finzen-app)** y debe estar levantado
> primero.

**FinZen** es una app de finanzas personales con un asistente de IA. Este frontend
está construido con **Next.js (App Router) + TypeScript + Tailwind CSS** y usa el
patrón **BFF** (Backend-for-Frontend): el navegador nunca habla directo con los
microservicios.

## Tabla de contenidos

- [Arquitectura (BFF)](#arquitectura-bff)
- [Vistas](#vistas)
- [Prerrequisitos](#prerrequisitos)
- [Inicio rápido (local)](#inicio-rápido-local)
- [Ejecutar con Docker](#ejecutar-con-docker)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue en AWS (EC2)](#despliegue-en-aws-ec2)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Problemas conocidos](#problemas-conocidos)
- [Autores y licencia](#autores-y-licencia)

## Arquitectura (BFF)

```text
Navegador  ──►  Next.js (BFF)  ──►  Nginx  ──►  microservicios FastAPI
                 /api/auth/*          :80          (finzen-app)
                 /api/backend/*
```

- El **JWT** se guarda en una **cookie `httpOnly`** (`finzen_token`), inaccesible
  desde JavaScript.
- El Route Handler `src/app/api/backend/[...path]/route.ts` lee esa cookie y añade
  `Authorization: Bearer <token>` al reenviar la petición al backend.
- `middleware.ts` protege las rutas privadas y redirige a `/login` si no hay sesión.

## Vistas

| Ruta | Descripción |
|---|---|
| `/` | Bienvenida |
| `/login`, `/register` | Autenticación |
| `/dashboard` | Balance, gráfico de gastos por categoría y accesos directos |
| `/incomes`, `/incomes/new`, `/incomes/[id]` | Ingresos |
| `/expenses`, `/expenses/new`, `/expenses/[id]` | Gastos (con filtros) |
| `/profile` | Edición de perfil y **clave de OpenAI** |
| `/assistant` | Chat de consulta inteligente (IA) |

## Prerrequisitos

- **Node.js** ≥ 20 (para desarrollo local)
- **Git** ≥ 2.40
- **Docker Desktop** ≥ 24 (para la opción con contenedores)
- El **backend** (`finzen-app`) levantado

## Inicio rápido (local)

```bash
# 1. Clonar
git clone https://github.com/UTEC-AII/finzen-webui.git
cd finzen-webui

# 2. Variables de entorno
cp .env.local.example .env.local

# 3. Instalar y arrancar
npm install
npm run dev
```

Abrir `http://localhost:3000`.

> `.env.local.example` apunta por defecto a los puertos directos del backend
> (`localhost:8001..8004`). Si el backend corre en Docker con Nginx, usa las rutas
> `http://localhost/api/...` (ver la sección Docker).

## Ejecutar con Docker

Con el backend dockerizado (red `finzen-app_backend-net`):

```bash
# 1. Construir la imagen (multi-etapa sobre node:20-alpine)
docker build -t finzen-webui .

# 2. Ejecutar conectado a la red del backend
docker run -d --name finzen-webui \
  --network finzen-app_backend-net \
  -p 3000:3000 \
  -e USER_API_URL=http://nginx/api/users \
  -e INCOME_API_URL=http://nginx/api/incomes \
  -e EXPENSE_API_URL=http://nginx/api/expenses \
  -e AI_API_URL=http://nginx/api/ai \
  finzen-webui
```

Abrir `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `USER_API_URL` | URL del user-service | `http://localhost:8001` |
| `INCOME_API_URL` | URL del income-service | `http://localhost:8002` |
| `EXPENSE_API_URL` | URL del expense-service | `http://localhost:8003` |
| `AI_API_URL` | URL del ai-service | `http://localhost:8004` |

> Son variables **de servidor** (sin `NEXT_PUBLIC_`): solo las usa el BFF y **nunca
> se exponen al navegador**. Con Docker/Nginx, apuntan a `http://nginx/api/...`.

## Despliegue en AWS (EC2)

> **Orden:** levanta primero el backend (`finzen-app`), porque este frontend se
> conecta a su red de Docker. Puedes usar **la misma instancia EC2** del backend.
>
> **Conexión:** usamos **EC2 Instance Connect** (terminal en el navegador), así que
> **no necesitas key pair ni `ssh -i`**.

1. **Instancia EC2**
   - Región: `us-east-1` · **AMI:** `cloud.22` (imagen de clase, con Docker/Python/Node
     preinstalados) o Ubuntu 24.04 LTS · Tipo: `t3.micro`
   - **Key pair:** ninguno (usaremos Instance Connect) · Asignar **IP elástica**

2. **Security Group** (reglas de entrada)
   - `22` (SSH) → `0.0.0.0/0` *(necesario para EC2 Instance Connect)*
   - `3000` (frontend) → `0.0.0.0/0` *(o `80` si publicas detrás de Nginx)*

3. **Conectarse (sin SSH)**
   - Consola **EC2** → selecciona la instancia → **Connect** →
   - pestaña **EC2 Instance Connect** → **Connect**.

4. **Clonar, construir y ejecutar (en la red del backend)**

   > Si no usas la AMI `cloud.22` y no tienes Docker, sigue la sección
   > **"Alternativa: Ubuntu desde cero"** en el README de
   > [finzen-app](https://github.com/UTEC-AII/finzen-app#alternativa-ubuntu-desde-cero-sin-la-ami-cloud22).

   ```bash
   git clone https://github.com/UTEC-AII/finzen-webui.git
   cd finzen-webui

   docker build -t finzen-webui .
   docker run -d --name finzen-webui \
     --network finzen-app_backend-net \
     -p 3000:3000 \
     -e USER_API_URL=http://nginx/api/users \
     -e INCOME_API_URL=http://nginx/api/incomes \
     -e EXPENSE_API_URL=http://nginx/api/expenses \
     -e AI_API_URL=http://nginx/api/ai \
     finzen-webui
   ```

5. **Probar**: `http://<TU-IP-ELASTICA>:3000`

> **Mac Apple Silicon:** construye con `docker build --platform linux/amd64 -t finzen-webui .`
> para que corra en EC2 (x86), o construye dentro de la instancia.

## Estructura del proyecto

```text
finzen-webui/
├── src/
│   ├── app/
│   │   ├── (auth)/          # /login, /register
│   │   ├── (dashboard)/     # /dashboard, /incomes, /expenses, /profile, /assistant
│   │   └── api/             # BFF: /api/auth/* y /api/backend/*
│   ├── components/          # UI, layout, charts, settings
│   ├── hooks/               # useUser
│   ├── lib/                 # api, i18n, theme, openai-key, format
│   └── types/
├── middleware.ts            # protección de rutas
├── Dockerfile               # build multi-etapa (node:20-alpine)
├── .env.local.example
└── README.md
```

## Problemas conocidos

- **Sesión expirada**: si el JWT caduca, el BFF redirige a `/login`.
- **Asistente deshabilitado**: requiere configurar la **clave de OpenAI** en
  `/profile`.
- **CORS**: en desarrollo, el backend permite `http://localhost:3000` vía
  `ALLOWED_ORIGINS`.
- **Hydration**: el tema e idioma se aplican antes del primer pintado para evitar
  parpadeos.

## Autores y licencia

Proyecto desarrollado para el curso de **Cloud Computing** de la
**Maestría en Ciencia de Datos e Inteligencia Artificial (CDIA) — UTEC**.

- **Sebastian Garcia Villacorta** — [@sebastian-rgv](https://github.com/sebastian-rgv)

Licencia: [MIT](LICENSE).
