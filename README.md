# API REST Node.js + PostgreSQL

API REST en **Node.js (Express 5)** con **PostgreSQL** y soporte de campos **JSONB**, lista para ejecutarse con **Docker Compose**.

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) con Docker Compose (incluido en Docker Desktop)
- Opcional (solo si quieres correrlo sin Docker): Node.js 20+

## Estructura

```
.
├── docker-compose.yml      # servicios db + api
├── Dockerfile              # imagen de PostgreSQL con database/db.sql
├── Dockerfile.api          # imagen del API (Node.js)
├── database/
│   └── db.sql              # esquema (tabla users + índice GIN)
└── src/
    ├── index.js            # arranca Express + documentación Scalar
    ├── config.js           # Puerto
    ├── db.js               # Pool de conexión a PostgreSQL
    ├── openapi.js          # Spec OpenAPI (documentación)
    ├── routes/
    │   └── user.routes.js  # endpoints
    └── controllers/
        └── users.controllers.js
```

## Cómo ejecutar desde cero

### Opción 1: Docker Compose (recomendada)

```bash
docker compose up -d --build
```

Eso levanta:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `db`     | 5432   | PostgreSQL 16. Al arrancar ejecuta automáticamente `database/db.sql` |
| `api`    | 4000   | Express. Espera a que la BD esté `healthy` antes de iniciar |

Verificar:

```bash
docker compose ps
docker compose logs -f api
```

Detener:

```bash
docker compose down        # detiene, conserva los datos
docker compose down -v     # detiene y borra los datos (volume pgdata)
```

> La primera ejecución crea el volumen `pgdata` con los datos; `db.sql` solo se ejecuta cuando la base está vacía.

### Opción 2: Sin Docker

1. Levanta PostgreSQL (por ejemplo con el contenedor de la base):

```bash
docker compose up -d db
```

2. Instala dependencias y arranca el API:

```bash
npm install
npm run dev      # con recarga automática (--watch)
# o
npm start
```

El API se conectará a `localhost:5432` (valores por defecto en `src/db.js`).

### Variables de entorno

| Variable   | Default   | Descripción            |
|------------|-----------|------------------------|
| `DB_HOST`  | `localhost` | Host de PostgreSQL   |
| `PORT`     | `4000`    | Puerto del API (definido en `src/config.js`) |

Credenciales por defecto (definidas en `docker-compose.yml`): usuario `postgres`, contraseña `postgres`, base `apirest`.

## Endpoints

| Método | Ruta            | Descripción           |
|--------|-----------------|-----------------------|
| GET    | `/users`        | Lista todos los usuarios |
| GET    | `/users/:id`    | Obtiene un usuario por id |
| POST   | `/users`        | Crea un usuario       |
| PUT    | `/users/:id`    | Actualiza un usuario  |
| DELETE | `/users/:id`    | Elimina un usuario    |

## Documentación interactiva (Scalar)

La API expone documentación generada con [Scalar](https://scalar.com/) a partir de un spec OpenAPI:

- **UI interactiva:** http://localhost:4000/docs
- **Spec OpenAPI (JSON):** http://localhost:4000/openapi.json

El spec está definido en `src/openapi.js` (esquemas `User`, `Profile`, `Error` y las 5 rutas). Desde `/docs` puedes probar cada endpoint contra la base de datos sin usar curl.

```bash
npm install @scalar/express-api-reference   # ya incluido en package.json
```

> Requiere Node.js 22+ (la imagen del API usa `node:22-alpine`).

## Ejemplos

### Crear usuario (POST)

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Rodríguez",
    "email": "carlos.rodriguez@example.com",
    "edad": 29,
    "profile": {
      "hobbies": ["Guitarra", "Programación", "Running"],
      "address": { "city": "Ciudad de México", "country": "México" },
      "preferences": { "theme": "dark", "notifications": true }
    }
  }'
```

Respuesta `201`:

```json
{
  "id": 1,
  "name": "Carlos Rodríguez",
  "email": "carlos.rodriguez@example.com",
  "edad": 29,
  "profile": {
    "hobbies": ["Guitarra", "Programación", "Running"],
    "address": { "city": "Ciudad de México", "country": "México" },
    "preferences": { "theme": "dark", "notifications": true }
  },
  "created_at": "2026-10-06T21:57:35.316Z"
}
```

### Listar usuarios (GET)

```bash
curl http://localhost:4000/users
```

### Obtener un usuario (GET)

```bash
curl http://localhost:4000/users/1
```

Si no existe responde `404`:

```json
{ "message": "Usuario no encontrado" }
```

### Actualizar usuario (PUT)

```bash
curl -X PUT http://localhost:4000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos R. López",
    "email": "carlos.rodriguez@example.com",
    "edad": 30,
    "profile": { "theme": "light", "notifications": false }
  }'
```

> El `PUT` reemplaza los campos enviados: `name`, `email`, `edad` y `profile`. `profile` se guarda como `{}` si no se envía.

### Eliminar usuario (DELETE)

```bash
curl -X DELETE http://localhost:4000/users/1
```

Respuesta:

```json
{ "message": "Usuario eliminado", "user": { "id": 1, "...": "..." } }
```

## Consultas JSONB en PostgreSQL

El campo `profile` es `JSONB` con índice GIN (`idx_users_profile`), así que puedes hacer consultas directas:

```bash
docker compose exec db psql -U postgres -d apirest
```

```sql
-- Insertar con JSONB
INSERT INTO users (name, email, edad, profile)
VALUES (
    'Elena Rostova',
    'elena.rostova@example.com',
    25,
    '{
        "hobbies": ["Fotografía", "Senderismo", "Piano"],
        "social_media": {
            "github": "elena-dev",
            "twitter": "@elena_code",
            "linkedin": "in/elenarostova"
        },
        "settings": { "language": "es", "2fa_enabled": true }
    }'::jsonb
)
RETURNING id, name, profile -> 'social_media' ->> 'github' AS github_user;

-- Buscar dentro del JSONB (usa el índice GIN)
SELECT name FROM users WHERE profile @> '{"settings": {"2fa_enabled": true}}';

-- Extraer valores anidados
SELECT name, profile -> 'social_media' ->> 'github' AS github_user FROM users;
```

## Estructura de la tabla

```sql
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(250) NOT NULL UNIQUE,
    edad INT,
    profile JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
