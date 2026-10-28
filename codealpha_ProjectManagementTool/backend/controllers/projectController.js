const {
  createProject,
  getProjectsForUser,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addMember,
  removeMember
} = require('../models/projectModel');
const { findUserByEmail } = require('../models/userModel');
const pool = require('../config/db');

const create = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const description = (req.body.description || '').trim();

    if (!name) return res.status(400).json({ message: 'Project name is required' });
    if (name.length > 150) return res.status(400).json({ message: 'Project name is too long' });

    const id = await createProject(name, description, req.user.id);
    res.status(201).json({ message: 'Project created', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const listMine = async (req, res) => {
  try {
    res.json(await getProjectsForUser(req.user.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const getOne = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const members = await getProjectMembers(req.params.id);
    res.json({ ...project, members, myRole: req.projectRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const update = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const description = (req.body.description || '').trim();

    if (!name) return res.status(400).json({ message: 'Project name is required' });

    await updateProject(req.params.id, name, description);
    res.json({ message: 'Project updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const remove = async (req, res) => {
  try {
    await deleteProject(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const invite = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const target = await findUserByEmail(email);
    if (!target) return res.status(404).json({ message: 'No account found with this email' });

    const added = await addMember(req.params.id, target.id);
    if (!added) return res.status(400).json({ message: 'This user is already a member' });

    const project = await getProjectById(req.params.id);
    await pool.query(
      'INSERT INTO notifications (recipient_id, actor_id, type, project_id) VALUES (?, ?, ?, ?)',
      [target.id, req.user.id, 'added_to_project', req.params.id]
    );
    req.io.to(`user:${target.id}`).emit('notification', { type: 'added_to_project' });

    res.json({ message: `${target.name} was added to ${project.name}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const kick = async (req, res) => {
  try {
    const memberId = Number(req.params.memberId);
    const project = await getProjectById(req.params.id);
    if (memberId === project.owner_id) {
      return res.status(400).json({ message: 'The project owner cannot be removed' });
    }

    await removeMember(req.params.id, memberId);
    res.json({ message: 'Member removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const leave = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (req.user.id === project.owner_id) {
      return res.status(400).json({ message: 'Transfer ownership or delete the project instead of leaving' });
    }

    await removeMember(req.params.id, req.user.id);
    res.json({ message: 'You left the project' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { create, listMine, getOne, update, remove, invite, kick, leave };