import pg from 'pg';

export const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'apirest'
});
