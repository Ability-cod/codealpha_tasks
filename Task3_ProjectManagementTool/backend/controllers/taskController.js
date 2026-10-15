const { getMemberRole } = require('../models/projectModel');
const {
  createTask,
  getNextTaskPosition,
  getTaskById,
  getTaskWithDetails,
  updateTask,
  moveTask,
  deleteTask
} = require('../models/taskModel');
const pool = require('../config/db');

const PRIORITIES = ['low', 'medium', 'high'];

const create = async (req, res) => {
  try {
    const { listId, projectId, assigneeId, dueDate } = req.body;
    const title = (req.body.title || '').trim();
    const description = (req.body.description || '').trim();
    const priority = PRIORITIES.includes(req.body.priority) ? req.body.priority : 'medium';

    const role = await getMemberRole(projectId, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const position = await getNextTaskPosition(listId);
    const id = await createTask(
      listId, projectId, title, description, assigneeId || null, dueDate || null,
      priority, req.user.id, position
    );

    if (assigneeId && Number(assigneeId) !== req.user.id) {
      await pool.query(
        'INSERT INTO notifications (recipient_id, actor_id, type, project_id, task_id) VALUES (?, ?, ?, ?, ?)',
        [assigneeId, req.user.id, 'assigned', projectId, id]
      );
      req.io.to(`user:${assigneeId}`).emit('notification', { type: 'assigned' });
    }

    const task = await getTaskWithDetails(id);
    req.io.to(`project:${projectId}`).emit('task_created', task);
    res.status(201).json({ message: 'Task created', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const update = async (req, res) => {
  try {
    const task = await getTaskById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const role = await getMemberRole(task.project_id, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });

    const title = (req.body.title || '').trim();
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const priority = PRIORITIES.includes(req.body.priority) ? req.body.priority : task.priority;
    const newAssignee = req.body.assigneeId !== undefined ? req.body.assigneeId || null : task.assignee_id;

    await updateTask(req.params.id, {
      title,
      description: (req.body.description || '').trim(),
      assigneeId: newAssignee,
      dueDate: req.body.dueDate !== undefined ? req.body.dueDate || null : task.due_date,
      priority
    });

    if (newAssignee && Number(newAssignee) !== task.assignee_id && Number(newAssignee) !== req.user.id) {
      await pool.query(
        'INSERT INTO notifications (recipient_id, actor_id, type, project_id, task_id) VALUES (?, ?, ?, ?, ?)',
        [newAssignee, req.user.id, 'assigned', task.project_id, task.id]
      );
      req.io.to(`user:${newAssignee}`).emit('notification', { type: 'assigned' });
    }

    const updated = await getTaskWithDetails(req.params.id);
    req.io.to(`project:${task.project_id}`).emit('task_updated', updated);
    res.json({ message: 'Task updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const move = async (req, res) => {
  try {
    const { listId, position } = req.body;
    const task = await getTaskById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const role = await getMemberRole(task.project_id, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });

    await moveTask(req.params.id, listId, position);
    req.io.to(`project:${task.project_id}`).emit('task_moved', {
      taskId: Number(req.params.id),
      listId,
      position
    });
    res.json({ message: 'Task moved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const remove = async (req, res) => {
  try {
    const task = await getTaskById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const role = await getMemberRole(task.project_id, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });

    await deleteTask(req.params.id);
    req.io.to(`project:${task.project_id}`).emit('task_deleted', { id: task.id, listId: task.list_id });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { create, update, move, remove };