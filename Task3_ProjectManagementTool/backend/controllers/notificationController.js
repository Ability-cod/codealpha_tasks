const { getNotifications, getUnreadCount, markAllAsRead } = require('../models/notificationModel');

const list = async (req, res) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 20, 50);
    const offset = Number.parseInt(req.query.offset, 10) || 0;
    res.json(await getNotifications(req.user.id, limit, offset));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const unreadCount = async (req, res) => {
  try {
    res.json({ count: await getUnreadCount(req.user.id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const markRead = async (req, res) => {
  try {
    await markAllAsRead(req.user.id);
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { list, unreadCount, markRead };