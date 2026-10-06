CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(250) NOT NULL UNIQUE,
    edad INT,
    profile JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear un índice sobre toda la columna JSONB
CREATE INDEX idx_users_profile ON users USING GIN (profile);