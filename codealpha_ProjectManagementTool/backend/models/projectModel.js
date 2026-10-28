const pool = require('../config/db');

const createProject = async (name, description, ownerId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)',
      [name, description, ownerId]
    );
    const projectId = result.insertId;

    await connection.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, ownerId, 'owner']
    );

    const defaultLists = ['To Do', 'In Progress', 'Done'];
    for (let i = 0; i < defaultLists.length; i++) {
      await connection.query(
        'INSERT INTO lists (project_id, name, position) VALUES (?, ?, ?)',
        [projectId, defaultLists[i], i]
      );
    }

    await connection.commit();
    return projectId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getProjectsForUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.description, p.owner_id, p.created_at, pm.role,
            (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS member_count,
            (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS task_count
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     WHERE pm.user_id = ?
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows;
};

const getProjectById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
  return rows[0];
};

const updateProject = async (id, name, description) => {
  await pool.query('UPDATE projects SET name = ?, description = ? WHERE id = ?', [
    name,
    description,
    id
  ]);
};

const deleteProject = async (id) => {
  await pool.query('DELETE FROM projects WHERE id = ?', [id]);
};

const getMemberRole = async (projectId, userId) => {
  const [rows] = await pool.query(
    'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, userId]
  );
  return rows[0]?.role || null;
};

const getProjectMembers = async (projectId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.avatar_url, pm.role, pm.joined_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = ?
     ORDER BY pm.joined_at ASC`,
    [projectId]
  );
  return rows;
};

const addMember = async (projectId, userId) => {
  const [result] = await pool.query(
    'INSERT IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
    [projectId, userId, 'member']
  );
  return result.affectedRows > 0;
};

const removeMember = async (projectId, userId) => {
  await pool.query('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [
    projectId,
    userId
  ]);
};

module.exports = {
  createProject,
  getProjectsForUser,
  getProjectById,
  updateProject,
  deleteProject,
  getMemberRole,
  getProjectMembers,
  addMember,
  removeMember
};