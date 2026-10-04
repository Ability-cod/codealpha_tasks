const pool = require('../config/db');

const createPost = async (userId, content, imageUrl) => {
  const [result] = await pool.query(
    'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
    [userId, content, imageUrl]
  );
  return result.insertId;
};

const getPostById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
  return rows[0];
};

const deletePost = async (id) => {
  await pool.query('DELETE FROM posts WHERE id = ?', [id]);
};

const getFeedPosts = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.content, p.image_url, p.created_at,
            u.id AS author_id, u.name AS author_name, u.username AS author_username, u.avatar_url AS author_avatar,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
            EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked_by_me
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = ? OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, userId, limit, offset]
  );
  return rows;
};

const getExplorePosts = async (userId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.content, p.image_url, p.created_at,
            u.id AS author_id, u.name AS author_name, u.username AS author_username, u.avatar_url AS author_avatar,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
            EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked_by_me
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
};

const getUserPosts = async (profileUserId, viewerId, limit, offset) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.content, p.image_url, p.created_at,
            u.id AS author_id, u.name AS author_name, u.username AS author_username, u.avatar_url AS author_avatar,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
            EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS liked_by_me
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [viewerId, profileUserId, limit, offset]
  );
  return rows;
};

module.exports = {
  createPost,
  getPostById,
  deletePost,
  getFeedPosts,
  getExplorePosts,
  getUserPosts
};