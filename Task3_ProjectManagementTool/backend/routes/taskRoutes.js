const express = require('express');
const router = express.Router();
const { create, update, move, remove } = require('../controllers/taskController');
const { list: listComments, create: createComment, remove: removeComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, create);
router.put('/:id', protect, update);
router.put('/:id/move', protect, move);
router.delete('/:id', protect, remove);

router.get('/:taskId/comments', protect, listComments);
router.post('/:taskId/comments', protect, createComment);
router.delete('/:taskId/comments/:commentId', protect, removeComment);

module.exports = router;