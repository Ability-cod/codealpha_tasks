const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
const postDir = path.join(__dirname, '..', 'uploads', 'posts');
[avatarDir, postDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

const makeStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      cb(null, `${unique}${extensions[file.mimetype]}`);
    }
  });

const uploadAvatar = multer({
  storage: makeStorage(avatarDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadPostImage = multer({
  storage: makeStorage(postDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { uploadAvatar, uploadPostImage, avatarDir, postDir };