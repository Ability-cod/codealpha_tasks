const pool = require('../config/db');

const addComment = async (taskId, userId, content) => {
  const [result] = await pool.query(
    'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)',
    [taskId, userId, content]
  );
  return result.insertId;
};

const getComments = async (taskId) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.content, c.created_at,
            u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar
     FROM task_comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.task_id = ?
     ORDER BY c.created_at ASC`,
    [taskId]
  );
  return rows;
};

const getCommentById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM task_comments WHERE id = ?', [id]);
  return rows[0];
};

const deleteComment = async (id) => {
  await pool.query('DELETE FROM task_comments WHERE id = ?', [id]);
};

module.exports = { addComment, getComments, getCommentById, deleteComment };