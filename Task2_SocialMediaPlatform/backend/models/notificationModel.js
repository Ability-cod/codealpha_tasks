const pool = require('../config/db');

const getNotifications = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT n.id, n.type, n.post_id, n.is_read, n.created_at,
            u.id AS actor_id, u.name AS actor_name, u.username AS actor_username, u.avatar_url AS actor_avatar
     FROM notifications n
     JOIN users u ON n.actor_id = u.id
     WHERE n.recipient_id = ?
     ORDER BY n.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
};

const getUnreadCount = async (userId) => {
  const [[row]] = await pool.query(
    'SELECT COUNT(*) AS count FROM notifications WHERE recipient_id = ? AND is_read = FALSE',
    [userId]
  );
  return row.count;
};

const markAllAsRead = async (userId) => {
  await pool.query('UPDATE notifications SET is_read = TRUE WHERE recipient_id = ?', [userId]);
};

module.exports = { getNotifications, getUnreadCount, markAllAsRead };