const { getMemberRole } = require('../models/projectModel');
const {
  getListsWithTasks,
  createList,
  getNextListPosition,
  getListById,
  renameList,
  reorderLists,
  deleteList
} = require('../models/listModel');

const board = async (req, res) => {
  try {
    const role = await getMemberRole(req.params.projectId, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });

    res.json(await getListsWithTasks(req.params.projectId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const create = async (req, res) => {
  try {
    const projectId = req.body.projectId;
    const name = (req.body.name || '').trim();

    const role = await getMemberRole(projectId, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });
    if (!name) return res.status(400).json({ message: 'List name is required' });

    const position = await getNextListPosition(projectId);
    const id = await createList(projectId, name, position);

    req.io.to(`project:${projectId}`).emit('list_created', { id, name, position, tasks: [] });
    res.status(201).json({ message: 'List created', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const rename = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'List name is required' });

    const list = await getListById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const role = await getMemberRole(list.project_id, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });

    await renameList(req.params.id, name);
    req.io.to(`project:${list.project_id}`).emit('list_renamed', { id: Number(req.params.id), name });
    res.json({ message: 'List renamed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const reorder = async (req, res) => {
  try {
    const { projectId, order } = req.body;
    const role = await getMemberRole(projectId, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });

    await reorderLists(projectId, order);
    req.io.to(`project:${projectId}`).emit('lists_reordered', { order });
    res.json({ message: 'Lists reordered' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const remove = async (req, res) => {
  try {
    const list = await getListById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const role = await getMemberRole(list.project_id, req.user.id);
    if (role !== 'owner') return res.status(403).json({ message: 'Only the project owner can delete lists' });

    await deleteList(req.params.id);
    req.io.to(`project:${list.project_id}`).emit('list_deleted', { id: Number(req.params.id) });
    res.json({ message: 'List deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { board, create, rename, reorder, remove };