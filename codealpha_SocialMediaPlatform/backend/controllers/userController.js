const fs = require('fs');
const path = require('path');
const { avatarDir } = require('../middleware/upload');
const {
  findUserByUsername,
  findUserById,
  updateProfile,
  searchUsers
} = require('../models/userModel');
const pool = require('../config/db');

const removeAvatarFile = (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) return;
  fs.unlink(path.join(avatarDir, path.basename(avatarUrl)), () => {});
};

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, username, bio, avatar_url, created_at FROM users WHERE username = ?',
      [req.params.username]
    );
    const profile = rows[0];
    if (!profile) return res.status(404).json({ message: 'User not found' });

    const [[followerCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM follows WHERE following_id = ?',
      [profile.id]
    );
    const [[followingCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?',
      [profile.id]
    );
    const [[postCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM posts WHERE user_id = ?',
      [profile.id]
    );

    let isFollowing = false;
    if (req.user) {
      const [rel] = await pool.query(
        'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
        [req.user.id, profile.id]
      );
      isFollowing = rel.length > 0;
    }

    res.json({
      ...profile,
      followerCount: followerCount.count,
      followingCount: followingCount.count,
      postCount: postCount.count,
      isFollowing,
      isSelf: req.user ? req.user.id === profile.id : false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const updateMyProfile = async (req, res) => {
  const newAvatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;
  try {
    const name = (req.body.name || '').trim();
    const bio = (req.body.bio || '').trim();

    if (!name) {
      removeAvatarFile(newAvatar);
      return res.status(400).json({ message: 'Name is required' });
    }
    if (bio.length > 280) {
      removeAvatarFile(newAvatar);
      return res.status(400).json({ message: 'Bio must be 280 characters or fewer' });
    }

    const existing = await findUserById(req.user.id);
    await updateProfile(req.user.id, name, bio, newAvatar);

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

const follow = async (req, res) => {
  try {
    const targetUsername = req.params.username;
    const target = await findUserByUsername(targetUsername);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    await pool.query(
      'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
      [req.user.id, target.id]
    );

    if (target.id !== req.user.id) {
      await pool.query(
        'INSERT INTO notifications (recipient_id, actor_id, type) VALUES (?, ?, ?)',
        [target.id, req.user.id, 'follow']
      );
    }

    res.json({ message: `You are now following ${target.username}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const unfollow = async (req, res) => {
  try {
    const target = await findUserByUsername(req.params.username);
    if (!target) return res.status(404).json({ message: 'User not found' });

    await pool.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [
      req.user.id,
      target.id
    ]);

    res.json({ message: `You unfollowed ${target.username}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { getProfile, updateMyProfile, search, follow, unfollow };