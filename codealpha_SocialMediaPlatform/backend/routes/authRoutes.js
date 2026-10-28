const express = require('express');
const router = express.Router();
const { register, login, verify2FA } = require('../controllers/authController');
const { setup, confirm, turnOff } = require('../controllers/twoFactorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/2fa/setup', protect, setup);
router.post('/2fa/confirm', protect, confirm);
router.post('/2fa/disable', protect, turnOff);

module.exports = router;