const pool = require('../config/db');

const createTask = async (listId, projectId, title, description, assigneeId, dueDate, priority, createdBy, position) => {
  const [result] = await pool.query(
    `INSERT INTO tasks (list_id, project_id, title, description, assignee_id, due_date, priority, created_by, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [listId, projectId, title, description, assigneeId, dueDate, priority, createdBy, position]
  );
  return result.insertId;
};

const getNextTaskPosition = async (listId) => {
  const [[row]] = await pool.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next FROM tasks WHERE list_id = ?',
    [listId]
  );
  return row.next;
};

const getTaskById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
  return rows[0];
};

const getTaskWithDetails = async (id) => {
  const [rows] = await pool.query(
    `SELECT t.*, u.name AS assignee_name, u.avatar_url AS assignee_avatar
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.id = ?`,
    [id]
  );
  return rows[0];
};

const updateTask = async (id, fields) => {
  await pool.query(
    `UPDATE tasks SET title = ?, description = ?, assignee_id = ?, due_date = ?, priority = ? WHERE id = ?`,
    [fields.title, fields.description, fields.assigneeId, fields.dueDate, fields.priority, id]
  );
};

const moveTask = async (taskId, newListId, newPosition) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[task]] = await connection.query('SELECT list_id, position FROM tasks WHERE id = ? FOR UPDATE', [
      taskId
    ]);

    if (task.list_id === newListId) {
      if (newPosition > task.position) {
        await connection.query(
          'UPDATE tasks SET position = position - 1 WHERE list_id = ? AND position > ? AND position <= ?',
          [newListId, task.position, newPosition]
        );
      } else if (newPosition < task.position) {
        await connection.query(
          'UPDATE tasks SET position = position + 1 WHERE list_id = ? AND position >= ? AND position < ?',
          [newListId, newPosition, task.position]
        );
      }
    } else {
      await connection.query(
        'UPDATE tasks SET position = position - 1 WHERE list_id = ? AND position > ?',
        [task.list_id, task.position]
      );
      await connection.query(
        'UPDATE tasks SET position = position + 1 WHERE list_id = ? AND position >= ?',
        [newListId, newPosition]
      );
    }

    await connection.query('UPDATE tasks SET list_id = ?, position = ? WHERE id = ?', [
      newListId,
      newPosition,
      taskId
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteTask = async (id) => {
  await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
};

module.exports = {
  createTask,
  getNextTaskPosition,
  getTaskById,
  getTaskWithDetails,
  updateTask,
  moveTask,
  deleteTask
};