const express = require('express');
const router = express.Router();
const { list, unreadCount, markRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, list);
router.get('/unread-count', protect, unreadCount);
router.put('/mark-read', protect, markRead);

module.exports = router;