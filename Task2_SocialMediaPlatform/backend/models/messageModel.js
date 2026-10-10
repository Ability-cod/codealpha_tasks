const pool = require('../config/db');

const saveMessage = async (senderId, receiverId, content) => {
  const [result] = await pool.query(
    'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
    [senderId, receiverId, content]
  );
  return result.insertId;
};

const getConversation = async (userId, otherUserId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT id, sender_id, receiver_id, content, is_read, created_at
     FROM messages
     WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, otherUserId, otherUserId, userId, limit, offset]
  );
  return rows.reverse();
};

const getConversationList = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
        u.id, u.name, u.username, u.avatar_url,
        m.content AS last_message, m.created_at AS last_message_at,
        m.sender_id AS last_sender_id,
        (SELECT COUNT(*) FROM messages
          WHERE sender_id = u.id AND receiver_id = ? AND is_read = FALSE) AS unread_count
     FROM messages m
     JOIN users u ON u.id = IF(m.sender_id = ?, m.receiver_id, m.sender_id)
     WHERE m.id IN (
        SELECT MAX(id) FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY IF(sender_id = ?, receiver_id, sender_id)
     )
     ORDER BY m.created_at DESC`,
    [userId, userId, userId, userId, userId]
  );
  return rows;
};

const markConversationRead = async (userId, otherUserId) => {
  await pool.query(
    'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
    [otherUserId, userId]
  );
};

const getTotalUnread = async (userId) => {
  const [[row]] = await pool.query(
    'SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
    [userId]
  );
  return row.count;
};

module.exports = {
  saveMessage,
  getConversation,
  getConversationList,
  markConversationRead,
  getTotalUnread
};