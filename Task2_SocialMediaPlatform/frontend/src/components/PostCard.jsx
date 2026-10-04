import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imageSrc, timeAgo } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';

export default function PostCard({ post, onDeleted }) {
  const { user, token } = useAuth();
  const { notify } = useToast();

  const [liked, setLiked] = useState(post.liked_by_me === 1 || post.liked_by_me === true);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentCount, setCommentCount] = useState(post.comment_count);

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      await api(`/posts/${post.id}/like`, { method: next ? 'POST' : 'DELETE', token });
    } catch (err) {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
      notify(err.message, 'error');
    }
  };

  const loadComments = async () => {
    setShowComments((prev) => !prev);
    if (!commentsLoaded) {
      try {
        const data = await api(`/posts/${post.id}/comments`, { token });
        setComments(data);
        setCommentsLoaded(true);
      } catch (err) {
        notify(err.message, 'error');
      }
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    try {
      const data = await api(`/posts/${post.id}/comments`, {
        method: 'POST',
        token,
        body: { content: text }
      });
      setComments((prev) => [
        ...prev,
        {
          id: data.id,
          content: text,
          created_at: new Date().toISOString(),
          author_id: user.id,
          author_name: user.name,
          author_username: user.username,
          author_avatar: user.avatar_url
        }
      ]);
      setCommentCount((c) => c + 1);
      setCommentText('');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api(`/posts/${post.id}/comments/${commentId}`, { method: 'DELETE', token });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((c) => c - 1);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const deletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api(`/posts/${post.id}`, { method: 'DELETE', token });
      notify('Post deleted');
      onDeleted(post.id);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const src = imageSrc(post.image_url);

  return (
    <article className="post-card">
      <div className="post-head">
        <Link to={`/profile/${post.author_username}`}>
          <Avatar src={post.author_avatar} name={post.author_name} size={44} />
        </Link>
        <div className="post-head-info">
          <Link to={`/profile/${post.author_username}`} className="post-author">
            {post.author_name}
          </Link>
          <span className="post-meta">@{post.author_username} · {timeAgo(post.created_at)}</span>
        </div>
        {post.author_id === user.id && (
          <button className="post-delete" onClick={deletePost} aria-label="Delete post">×</button>
        )}
      </div>

      {post.content && <p className="post-content">{post.content}</p>}
      {src && <img src={src} alt="" className="post-image" />}

      <div className="post-stats">
        <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
        <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
      </div>

      <div className="post-actions">
        <button className={`post-action ${liked ? 'liked' : ''}`} onClick={toggleLike}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Like
        </button>
        <button className="post-action" onClick={loadComments}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Comment
        </button>
      </div>

      {showComments && (
        <div className="comments">
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <Avatar src={c.author_avatar} name={c.author_name} size={32} />
              <div className="comment-body">
                <div className="comment-bubble">
                  <Link to={`/profile/${c.author_username}`} className="comment-author">{c.author_name}</Link>
                  <p>{c.content}</p>
                </div>
                <div className="comment-meta">
                  <span>{timeAgo(c.created_at)}</span>
                  {c.author_id === user.id && (
                    <button onClick={() => deleteComment(c.id)}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <form className="comment-form" onSubmit={submitComment}>
            <Avatar src={user.avatar_url} name={user.name} size={32} />
            <input
              className="input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="btn btn-sm" disabled={!commentText.trim()}>Send</button>
          </form>
        </div>
      )}
    </article>
  );
}