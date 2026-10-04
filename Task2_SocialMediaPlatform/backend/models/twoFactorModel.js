const pool = require('../config/db');

const setSecret = async (userId, secret) => {
  await pool.query('UPDATE users SET two_factor_secret = ? WHERE id = ?', [secret, userId]);
};

const enable = async (userId) => {
  await pool.query('UPDATE users SET two_factor_enabled = TRUE WHERE id = ?', [userId]);
};

const disable = async (userId) => {
  await pool.query(
    'UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = ?',
    [userId]
  );
};

const getSecret = async (userId) => {
  const [rows] = await pool.query(
    'SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = ?',
    [userId]
  );
  return rows[0];
};

module.exports = { setSecret, enable, disable, getSecret };