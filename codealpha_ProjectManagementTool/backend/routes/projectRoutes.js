const express = require('express');
const router = express.Router();
const { create, listMine, getOne, update, remove, invite, kick, leave } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { requireMember, requireOwner } = require('../middleware/projectAccess');

router.post('/', protect, create);
router.get('/', protect, listMine);
router.get('/:id', protect, requireMember, getOne);
router.put('/:id', protect, requireOwner, update);
router.delete('/:id', protect, requireOwner, remove);
router.post('/:id/invite', protect, requireOwner, invite);
router.delete('/:id/members/:memberId', protect, requireOwner, kick);
router.post('/:id/leave', protect, requireMember, leave);

module.exports = router;