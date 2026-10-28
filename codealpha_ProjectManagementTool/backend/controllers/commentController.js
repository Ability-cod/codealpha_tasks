const { getMemberRole } = require('../models/projectModel');
const { getTaskById } = require('../models/taskModel');
const { addComment, getComments, getCommentById, deleteComment } = require('../models/commentModel');
const pool = require('../config/db');

const list = async (req, res) => {
  try {
    const task = await getTaskById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const role = await getMemberRole(task.project_id, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });

    res.json(await getComments(req.params.taskId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const create = async (req, res) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) return res.status(400).json({ message: 'Comment cannot be empty' });
    if (content.length > 1000) return res.status(400).json({ message: 'Comment is too long' });

    const task = await getTaskById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const role = await getMemberRole(task.project_id, req.user.id);
    if (!role) return res.status(403).json({ message: 'You are not a member of this project' });

    const id = await addComment(req.params.taskId, req.user.id, content);

    if (task.assignee_id && task.assignee_id !== req.user.id) {
      await pool.query(
        'INSERT INTO notifications (recipient_id, actor_id, type, project_id, task_id) VALUES (?, ?, ?, ?, ?)',
        [task.assignee_id, req.user.id, 'comment', task.project_id, task.id]
      );
      req.io.to(`user:${task.assignee_id}`).emit('notification', { type: 'comment' });
    }

    const comment = {
      id,
      content,
      created_at: new Date().toISOString(),
      author_id: req.user.id,
      author_name: req.user.name,
      author_avatar: req.user.avatar_url
    };
    req.io.to(`project:${task.project_id}`).emit('comment_added', { taskId: task.id, comment });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const remove = async (req, res) => {
  try {
    const comment = await getCommentById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    const task = await getTaskById(req.params.taskId);
    await deleteComment(req.params.commentId);

    req.io.to(`project:${task.project_id}`).emit('comment_deleted', {
      taskId: task.id,
      commentId: Number(req.params.commentId)
    });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { list, create, remove };