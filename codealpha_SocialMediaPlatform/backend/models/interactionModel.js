const pool = require('../config/db');

const addLike = async (postId, userId) => {
  const [result] = await pool.query(
    'INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)',
    [postId, userId]
  );
  return result.affectedRows > 0;
};

const removeLike = async (postId, userId) => {
  await pool.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
};

const addComment = async (postId, userId, content) => {
  const [result] = await pool.query(
    'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
    [postId, userId, content]
  );
  return result.insertId;
};

const getComments = async (postId) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.content, c.created_at,
            u.id AS author_id, u.name AS author_name, u.username AS author_username, u.avatar_url AS author_avatar
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return rows;
};

const getCommentById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
  return rows[0];
};

const deleteComment = async (id) => {
  await pool.query('DELETE FROM comments WHERE id = ?', [id]);
};

module.exports = { addLike, removeLike, addComment, getComments, getCommentById, deleteComment };