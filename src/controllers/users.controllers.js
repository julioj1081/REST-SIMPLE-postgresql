import { pool } from '../db.js';

export const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, edad, profile } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, edad, profile) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, edad, profile || {}]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, edad, profile } = req.body;
    const { rows } = await pool.query(
      `UPDATE users
         SET name = $1, email = $2, edad = $3, profile = $4
       WHERE id = $5
       RETURNING *`,
      [name, email, edad, profile || {}, id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({ message: 'Usuario eliminado', user: rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
