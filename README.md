# Task App - Aplicación de Gestión de Tareas

## Requisitos

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 12+ (o usa Docker)

## Instalación Local

### 1. Clonar repositorio
```bash
git clone https://github.com/Andersonbaltazar/practica4nube.git
cd practica4nube
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env`:
```
NODE_ENV=development
PORT=3000
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_app
SESSION_SECRET=tu-secreto-super-secreto
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Iniciar con Docker Compose
```bash
docker-compose up -d
```

La aplicación estará en: `http://localhost:3000`
