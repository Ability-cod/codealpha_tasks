const express = require('express');
const router = express.Router();
const { board, create, rename, reorder, remove } = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

router.get('/project/:projectId', protect, board);
router.post('/', protect, create);
router.put('/reorder', protect, reorder);
router.put('/:id', protect, rename);
router.delete('/:id', protect, remove);

module.exports = router;