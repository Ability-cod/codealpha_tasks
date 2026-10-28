const fs = require('fs');
const path = require('path');
const { avatarDir } = require('../middleware/upload');
const { updateProfile, searchUsers, findUserById } = require('../models/userModel');

const removeAvatarFile = (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) return;
  fs.unlink(path.join(avatarDir, path.basename(avatarUrl)), () => {});
};

const updateMyProfile = async (req, res) => {
  const newAvatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;
  try {
    const name = (req.body.name || '').trim();
    if (!name) {
      removeAvatarFile(newAvatar);
      return res.status(400).json({ message: 'Name is required' });
    }

    const existing = await findUserById(req.user.id);
    await updateProfile(req.user.id, name, newAvatar);

    if (newAvatar) removeAvatarFile(existing.avatar_url);
    res.json({ message: 'Profile updated' });
  } catch (error) {
    removeAvatarFile(newAvatar);
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const search = async (req, res) => {
  try {
    const term = (req.query.q || '').trim();
    if (term.length < 1) return res.json([]);
    res.json(await searchUsers(term, req.user.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { updateMyProfile, search };