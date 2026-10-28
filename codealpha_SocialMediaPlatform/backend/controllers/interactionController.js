const pool = require('../config/db');
const {
  addLike,
  removeLike,
  addComment,
  getComments,
  getCommentById,
  deleteComment
} = require('../models/interactionModel');
const { getPostById } = require('../models/postModel');

const likePost = async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const wasNew = await addLike(post.id, req.user.id);

    if (wasNew && post.user_id !== req.user.id) {
      await pool.query(
        'INSERT INTO notifications (recipient_id, actor_id, type, post_id) VALUES (?, ?, ?, ?)',
        [post.user_id, req.user.id, 'like', post.id]
      );
    }

    res.json({ message: 'Post liked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const unlikePost = async (req, res) => {
  try {
    await removeLike(req.params.id, req.user.id);
    res.json({ message: 'Post unliked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const listComments = async (req, res) => {
  try {
    res.json(await getComments(req.params.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const createComment = async (req, res) => {
  try {
    const content = (req.body.content || '').trim();
    if (!content) return res.status(400).json({ message: 'Comment cannot be empty' });
    if (content.length > 500) {
      return res.status(400).json({ message: 'Comment is too long' });
    }

    const post = await getPostById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const id = await addComment(post.id, req.user.id, content);

    if (post.user_id !== req.user.id) {
      await pool.query(
        'INSERT INTO notifications (recipient_id, actor_id, type, post_id) VALUES (?, ?, ?, ?)',
        [post.user_id, req.user.id, 'comment', post.id]
      );
    }

    res.status(201).json({ message: 'Comment added', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

const removeComment = async (req, res) => {
  try {
    const comment = await getCommentById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await deleteComment(req.params.commentId);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on the server' });
  }
};

module.exports = { likePost, unlikePost, listComments, createComment, removeComment };