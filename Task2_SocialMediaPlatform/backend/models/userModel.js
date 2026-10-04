const pool = require('../config/db');

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const findUserByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, username, email, bio, avatar_url, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

const createUser = async (name, username, email, hashedPassword) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
    [name, username, email, hashedPassword]
  );
  return result.insertId;
};

const updateProfile = async (id, name, bio, avatarUrl) => {
  if (avatarUrl) {
    await pool.query('UPDATE users SET name = ?, bio = ?, avatar_url = ? WHERE id = ?', [
      name,
      bio,
      avatarUrl,
      id
    ]);
  } else {
    await pool.query('UPDATE users SET name = ?, bio = ? WHERE id = ?', [name, bio, id]);
  }
};

const searchUsers = async (term, excludeId) => {
  const [rows] = await pool.query(
    `SELECT id, name, username, avatar_url FROM users
     WHERE (name LIKE ? OR username LIKE ?) AND id != ?
     LIMIT 20`,
    [`%${term}%`, `%${term}%`, excludeId]
  );
  return rows;
};

module.exports = {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  updateProfile,
  searchUsers
};