const express = require('express');
const router = express.Router();
const { getProfile, updateMyProfile, search, follow, unfollow } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/upload');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  protect(req, res, next);
};

router.get('/search', protect, search);
router.get('/:username', optionalAuth, getProfile);
router.put('/me/profile', protect, uploadAvatar.single('avatar'), updateMyProfile);
router.post('/:username/follow', protect, follow);
router.delete('/:username/follow', protect, unfollow);

module.exports = router;