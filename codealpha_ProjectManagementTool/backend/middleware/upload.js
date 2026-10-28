const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const extensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

const fileFilter = (req, file, cb) => {
  if (extensions[file.mimetype]) cb(null, true);
  else cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'));
};

const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      cb(null, `${unique}${extensions[file.mimetype]}`);
    }
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { uploadAvatar, avatarDir };