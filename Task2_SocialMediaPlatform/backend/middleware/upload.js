const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
const postDir = path.join(__dirname, '..', 'uploads', 'posts');
[avatarDir, postDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const imageExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

const videoExtensions = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov'
};

const mediaExtensions = { ...imageExtensions, ...videoExtensions };

const imageFilter = (req, file, cb) => {
  if (imageExtensions[file.mimetype]) cb(null, true);
  else cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'));
};

const mediaFilter = (req, file, cb) => {
  if (mediaExtensions[file.mimetype]) cb(null, true);
  else cb(new Error('Only JPG, PNG, WEBP, GIF images or MP4, WEBM, MOV videos are allowed'));
};

const makeStorage = (destination, extMap) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      cb(null, `${unique}${extMap[file.mimetype]}`);
    }
  });

const uploadAvatar = multer({
  storage: makeStorage(avatarDir, imageExtensions),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadPostImage = multer({
  storage: makeStorage(postDir, mediaExtensions),
  fileFilter: mediaFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const mediaTypeFor = (mimetype) => (videoExtensions[mimetype] ? 'video' : 'image');

module.exports = { uploadAvatar, uploadPostImage, avatarDir, postDir, mediaTypeFor, videoExtensions };