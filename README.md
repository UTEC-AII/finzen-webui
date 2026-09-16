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
   - Región: `us-east-1` · **AMI:** `Cloud9Ubuntu22` (imagen de clase, con Docker/Python/Node
     preinstalados) o Ubuntu 24.04 LTS · Tipo: `t3.micro`
   - **Key pair:** ninguno (usaremos Instance Connect) · Asignar **IP elástica**

2. **Security Group** (reglas de entrada)
   - `22` (SSH) → `0.0.0.0/0` *(necesario para EC2 Instance Connect)*
   - `80` (HTTP) → `0.0.0.0/0` *(Nginx sirve el frontend en `/` y las APIs en `/api/*`)*

> **Red:** la **VPC por defecto** ya trae **Internet Gateway** y la **Route Table**
> (`0.0.0.0/0 → IGW`) sobre subredes públicas, así que la instancia con **IP elástica**
> tiene internet entrante y saliente sin crear nada extra (ni NAT Gateway).
>
> **Almacenamiento y red Docker:** los datos persisten en **volúmenes Docker** sobre
> el disco **EBS** de la instancia; y este frontend se conecta a los servicios por la
> **red interna de Docker Compose** (por nombre de servicio), no por `localhost`.

3. **Conectarse (sin SSH)**
   - Consola **EC2** → selecciona la instancia → **Connect** →
   - pestaña **EC2 Instance Connect** → **Connect**.

4. **Clonar, construir y ejecutar (en la red del backend)**

   > Antes de levantar el backend, libera el puerto 80 en la EC2
   > (`sudo systemctl stop apache2`), o Nginx no arrancará. Ver la guía completa en
   > [finzen-app](https://github.com/UTEC-AII/finzen-app#despliegue-en-aws-ec2).
   >
   > **Memoria (t3.micro = 1 GB):** el `npm run build` de Next.js consume mucha RAM y
   > puede colgarse o morir por falta de memoria (OOM). Agrega **swap** antes de construir:
   >
   > ```bash
   > sudo fallocate -l 2G /swapfile
   > sudo chmod 600 /swapfile
   > sudo mkswap /swapfile
   > sudo swapon /swapfile
   > free -h      # debe mostrar ~2 GB de swap
   > ```
   >
   > Alternativa: construye en tu equipo con `--platform linux/amd64`, súbela a Docker
   > Hub y en la EC2 haz `docker pull` (no compila → no consume RAM).

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

5. **Probar**: `http://<TU-IP-ELASTICA>` (puerto 80, servido por Nginx).

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

- **Build se cuelga o falla (sin memoria)**: `next build` necesita más RAM que el 1 GB
  del `t3.micro`. Agrega **swap de 2 GB** antes de construir (ver Despliegue en AWS).
- **No entra al dashboard tras iniciar sesión**: la cookie de sesión se marca `secure`
  solo si la petición llega por **HTTPS**; sobre HTTP funciona. Verifica en DevTools →
  Application → Cookies que exista `finzen_token`.
- **Tras reiniciar la instancia EC2**: los contenedores **no arrancan solos**. Vuelve a
  levantarlos: `cd finzen-app && docker compose up -d` y `docker start finzen-webui`.
- **Sesión expirada**: si el JWT caduca, el BFF redirige a `/login`.
- **Asistente deshabilitado**: requiere configurar la **clave de OpenAI** en
  `/profile`.
- **CORS**: en desarrollo, el backend permite `http://localhost:3000` vía
  `ALLOWED_ORIGINS`.
- **Hydration**: el tema e idioma se aplican antes del primer pintado para evitar
  parpadeos.

## Autores y licencia

Proyecto desarrollado para el curso de **Cloud Computing (MCD8007)** de la
**Maestría en Ciencia de Datos e Inteligencia Artificial (CDIA) — UTEC**.
Docente: **Mejia Fernandez, Oscar Rodolfo**.

**Grupo 2 — Integrantes:**
- García Villacorta, Sebastian Rodrigo — [@sebastian-rgv](https://github.com/sebastian-rgv)
- Barreto Daza, Dante Guillermo
- Chulluncuy Reynoso, Clinton
- Hilario Orihuela, Ronald Ramiro

Licencia: [MIT](LICENSE).
