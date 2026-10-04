const express = require('express');
const router = express.Router();
const { createNewPost, removeMyPost, feed, explore, postsByUser } = require('../controllers/postController');
const {
  likePost,
  unlikePost,
  listComments,
  createComment,
  removeComment
} = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');
const { uploadPostImage } = require('../middleware/upload');

router.get('/feed', protect, feed);
router.get('/explore', protect, explore);
router.get('/user/:username', protect, postsByUser);
router.post('/', protect, uploadPostImage.single('image'), createNewPost);
router.delete('/:id', protect, removeMyPost);

router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);
router.get('/:id/comments', protect, listComments);
router.post('/:id/comments', protect, createComment);
router.delete('/:id/comments/:commentId', protect, removeComment);

module.exports = router;