const pool = require('../config/db');

const getListsWithTasks = async (projectId) => {
  const [lists] = await pool.query(
    'SELECT id, name, position FROM lists WHERE project_id = ? ORDER BY position ASC',
    [projectId]
  );

  const [tasks] = await pool.query(
    `SELECT t.id, t.list_id, t.title, t.description, t.due_date, t.priority, t.position,
            t.created_by, t.created_at,
            u.id AS assignee_id, u.name AS assignee_name, u.avatar_url AS assignee_avatar,
            (SELECT COUNT(*) FROM task_comments WHERE task_id = t.id) AS comment_count
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.project_id = ?
     ORDER BY t.position ASC`,
    [projectId]
  );

  return lists.map((list) => ({
    ...list,
    tasks: tasks.filter((task) => task.list_id === list.id)
  }));
};

const createList = async (projectId, name, position) => {
  const [result] = await pool.query(
    'INSERT INTO lists (project_id, name, position) VALUES (?, ?, ?)',
    [projectId, name, position]
  );
  return result.insertId;
};

const getNextListPosition = async (projectId) => {
  const [[row]] = await pool.query(
    'SELECT COALESCE(MAX(position), -1) + 1 AS next FROM lists WHERE project_id = ?',
    [projectId]
  );
  return row.next;
};

const getListById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM lists WHERE id = ?', [id]);
  return rows[0];
};

const renameList = async (id, name) => {
  await pool.query('UPDATE lists SET name = ? WHERE id = ?', [name, id]);
};

const reorderLists = async (projectId, orderedIds) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (let i = 0; i < orderedIds.length; i++) {
      await connection.query('UPDATE lists SET position = ? WHERE id = ? AND project_id = ?', [
        i,
        orderedIds[i],
        projectId
      ]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteList = async (id) => {
  await pool.query('DELETE FROM lists WHERE id = ?', [id]);
};

module.exports = {
  getListsWithTasks,
  createList,
  getNextListPosition,
  getListById,
  renameList,
  reorderLists,
  deleteList
};