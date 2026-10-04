const fs = require('fs');
const path = require('path');
const { postDir } = require('../middleware/upload');
const {
  createPost,
  getPostById,
  deletePost,
  getFeedPosts,
  getExplorePosts,
  getUserPosts
} = require('../models/postModel');
const pool = require('../config/db');

const removePostImage = (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith('/uploads/posts/')) return;
  fs.unlink(path.join(postDir, path.basename(imageUrl)), () => {});
};

const createNewPost = async (req, res) => {
  const imageUrl = req.file ? `/uploads/posts/${req.file.filename}` : null;
  try {
    const content = (req.body.content || '').trim();

    if (!content && !imageUrl) {
      removePostImage(imageUrl);
      return res.status(400).json({ message: 'Write something or add an image to post' });
    }
    if (content.length > 2000) {
      removePostImage(imageUrl);
      return res.status(400).json({ message: 'Post is too long' });
    }

    const id = await createPost(req.user.id, content, imageUrl);
    res.status(201).json({ message: 'Post created', id });
  } catch (error) {
    removePostImage(imageUrl);
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const removeMyPost = async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await deletePost(req.params.id);
    removePostImage(post.image_url);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const parsePagination = (req) => {
  const limit = Math.min(Number.parseInt(req.query.limit, 10) || 10, 30);
  const offset = Number.parseInt(req.query.offset, 10) || 0;
  return { limit, offset };
};

const feed = async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req);
    res.json(await getFeedPosts(req.user.id, limit, offset));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const explore = async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req);
    res.json(await getExplorePosts(req.user.id, limit, offset));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const postsByUser = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [
      req.params.username
    ]);
    if (!users[0]) return res.status(404).json({ message: 'User not found' });

    const { limit, offset } = parsePagination(req);
    res.json(await getUserPosts(users[0].id, req.user.id, limit, offset));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { createNewPost, removeMyPost, feed, explore, postsByUser };