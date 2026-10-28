const pool = require('../config/db');
const {
  saveMessage,
  getConversation,
  getConversationList,
  markConversationRead,
  getTotalUnread
} = require('../models/messageModel');

const conversations = async (req, res) => {
  try {
    res.json(await getConversationList(req.user.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const unreadTotal = async (req, res) => {
  try {
    res.json({ count: await getTotalUnread(req.user.id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const history = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [
      req.params.username
    ]);
    if (!users[0]) return res.status(404).json({ message: 'User not found' });

    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 30, 100);
    const offset = Number.parseInt(req.query.offset, 10) || 0;

    await markConversationRead(req.user.id, users[0].id);
    res.json(await getConversation(req.user.id, users[0].id, limit, offset));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const send = async (req, res) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) return res.status(400).json({ message: 'Message cannot be empty' });
    if (content.length > 2000) return res.status(400).json({ message: 'Message is too long' });

    const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [
      req.params.username
    ]);
    if (!users[0]) return res.status(404).json({ message: 'User not found' });
    if (users[0].id === req.user.id) {
      return res.status(400).json({ message: 'You cannot message yourself' });
    }

    const id = await saveMessage(req.user.id, users[0].id, content);

    const message = {
      id,
      sender_id: req.user.id,
      receiver_id: users[0].id,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };

    req.io.to(`user:${users[0].id}`).emit('new_message', message);

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { conversations, unreadTotal, history, send };