const pool = require('../config/db');

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

const createUser = async (name, email, hashedPassword) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );
  return result.insertId;
};

const updateProfile = async (id, name, avatarUrl) => {
  if (avatarUrl) {
    await pool.query('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?', [
      name,
      avatarUrl,
      id
    ]);
  } else {
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
  }
};

const searchUsers = async (term, excludeId) => {
  const [rows] = await pool.query(
    `SELECT id, name, email, avatar_url FROM users
     WHERE (name LIKE ? OR email LIKE ?) AND id != ?
     LIMIT 20`,
    [`%${term}%`, `%${term}%`, excludeId]
  );
  return rows;
};

module.exports = { findUserByEmail, findUserById, createUser, updateProfile, searchUsers };