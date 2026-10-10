const express = require('express');
const router = express.Router();
const { conversations, unreadTotal, history, send } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, conversations);
router.get('/unread-count', protect, unreadTotal);
router.get('/:username', protect, history);
router.post('/:username', protect, send);

module.exports = router;