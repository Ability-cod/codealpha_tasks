const express = require('express');
const router = express.Router();
const { updateMyProfile, search } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/upload');

router.get('/search', protect, search);
router.put('/me/profile', protect, uploadAvatar.single('avatar'), updateMyProfile);

module.exports = router;