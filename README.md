# Task App - Sistema de Tareas con Autenticación 2FA

Una aplicación web de gestión de tareas con autenticación segura de dos factores (2FA) usando Google Authenticator.

## 📋 Requisitos del Proyecto

✅ **Pregunta 1 (5pts)**: CloudFormation con instancia Ubuntu 20, puerto 3000
✅ **Pregunta 2 (7pts)**: Framework Express.js, login/registro y autenticación 2FA
✅ **Pregunta 3 (3pts)**: Base de datos PostgreSQL en RDS
✅ **Pregunta 4 (5pts)**: Dockerfile y docker-compose configurados

## 🚀 Características

- 📝 Crear, editar y eliminar tareas
- 🔐 Registro e inicio de sesión seguro
- 🔑 Autenticación de dos factores (2FA) con Google Authenticator
- 💾 Base de datos PostgreSQL
- 🐳 Completamente containerizado con Docker
- ☁️ Desplegable en AWS con CloudFormation

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Base de Datos**: PostgreSQL 14
- **2FA**: speakeasy + qrcode
- **Autenticación**: bcryptjs + express-session
- **Contenedorización**: Docker + Docker Compose

## 📦 Instalación Local

### Prerrequisitos
- Docker y Docker Compose instalados
- Node.js 18+ (para desarrollo local)
- PostgreSQL (opcional, se ejecuta en contenedor)

### Pasos

1. **Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd practica4
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

3. **Levantar los contenedores**
```bash
docker-compose up -d
```

4. **Acceder a la aplicación**
```
http://localhost:3000
```

## 🚀 Despliegue en AWS

### Opción 1: Usando CloudFormation (Automatizado)

1. **Preparar el repositorio**
```bash
# Asegurar que el repositorio está en GitHub
git push origin main
```

2. **Desplegar con CloudFormation**
```bash
aws cloudformation create-stack \
  --stack-name task-app-stack \
  --template-body file://cloudformation-template.yaml \
  --parameters ParameterKey=KeyName,ParameterValue=your-key-pair \
               ParameterKey=InstanceType,ParameterValue=t2.micro \
  --region us-east-1
```

3. **Verificar el estado del stack**
```bash
aws cloudformation describe-stacks \
  --stack-name task-app-stack \
  --region us-east-1
```

### Opción 2: Despliegue Manual en EC2

1. **Lanzar instancia Ubuntu 20.04**
   - t2.micro o superior
   - Abrir puertos: 22, 80, 443, 3000

2. **Conectarse a la instancia**
```bash
ssh -i your-key.pem ubuntu@<IP_PUBLICA>
```

3. **Instalar Docker**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```

4. **Clonar repositorio y desplegar**
```bash
git clone <URL_DEL_REPOSITORIO>
cd practica4
docker-compose up -d
```

5. **Verificar que esté corriendo**
```bash
docker-compose ps
```

## 📝 Uso de la Aplicación

### Registro
1. Ir a `/register`
2. Ingresar usuario, email y contraseña
3. Confirmar contraseña

### Login
1. Ir a `/login`
2. Ingresar usuario y contraseña

### Configurar 2FA
1. Una vez logueado, hacer clic en "🔐 Configurar 2FA"
2. Escanear el código QR con Google Authenticator
3. Ingresar el código de 6 dígitos generado

### Usar 2FA en siguiente login
1. Ingresar usuario y contraseña
2. Se pedirá código de 2FA
3. Ingresar código de la app autenticadora

### Gestionar Tareas
1. Crear tarea: Ingresar título y descripción
2. Marcar como completa: Click en ✓
3. Eliminar tarea: Click en 🗑️ Eliminar

## 📊 Estructura del Proyecto

```
practica4/
├── src/
│   ├── server.js           # Servidor principal
│   ├── db/
│   │   └── database.js     # Conexión y esquema de BD
│   └── routes/
│       ├── auth.js         # Rutas de autenticación
│       └── tasks.js        # Rutas de tareas
├── views/
│   ├── login.ejs           # Página de login
│   ├── register.ejs        # Página de registro
│   ├── 2fa.ejs             # Página de verificación 2FA
│   └── dashboard.ejs       # Dashboard de tareas
├── public/                 # Archivos estáticos
├── config/                 # Configuraciones
├── Dockerfile              # Configuración Docker
├── docker-compose.yml      # Orquestación de contenedores
├── cloudformation-template.yaml  # Template de AWS
├── .env                    # Variables de entorno
├── .env.example            # Ejemplo de variables
├── .gitignore              # Archivos a ignorar en git
├── package.json            # Dependencias de Node.js
└── README.md               # Este archivo
```

## 🔐 Variables de Entorno

```env
# Aplicación
NODE_ENV=production
PORT=3000

# Base de Datos
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=db
DB_PORT=5432
DB_NAME=task_app

# Sesión
SESSION_SECRET=tu-secreto-super-secreto
```

## 🐳 Comandos Docker

```bash
# Iniciar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener contenedores
docker-compose down

# Reconstruir imágenes
docker-compose build

# Ejecutar comando en contenedor
docker-compose exec app npm install
```

## 🧪 Testing

### Crear usuario de prueba
```bash
# POST http://localhost:3000/api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Verificar conexión a BD
```bash
docker-compose exec db psql -U postgres -d task_app -c "\dt"
```

## 📋 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/setup-2fa` - Configurar 2FA
- `POST /api/auth/confirm-2fa` - Confirmar 2FA
- `POST /api/auth/verify-2fa` - Verificar código 2FA
- `POST /api/auth/logout` - Cerrar sesión

### Tareas
- `GET /api/tasks/` - Obtener todas las tareas
- `POST /api/tasks/` - Crear tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea

## 🐛 Troubleshooting

### Error de conexión a BD
```bash
# Verificar que db está corriendo
docker-compose ps

# Ver logs de la BD
docker-compose logs db
```

### Puerto 3000 ya está en uso
```bash
# Cambiar puerto en docker-compose.yml o .env
PORT=3001 docker-compose up -d
```

### Problemas con permisos en Linux
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 📸 Capturas de Pantalla

1. **Login**: Página de inicio de sesión
2. **Registro**: Página de registro
3. **2FA Setup**: Configuración de Google Authenticator
4. **Dashboard**: Panel de tareas
5. **CloudFormation**: Stack creado en AWS

## 📚 Referencias

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [AWS CloudFormation](https://aws.amazon.com/cloudformation/)
- [Google Authenticator API](https://github.com/speakeasyjs/speakeasy)

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

## 👤 Autor

Proyecto de práctica - 2024

---

**Nota**: Para producción, cambiar todas las contraseñas y secretos por valores seguros.
