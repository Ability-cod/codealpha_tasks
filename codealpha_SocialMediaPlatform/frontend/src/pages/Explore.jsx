import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function Explore() {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api('/posts/explore', { token })
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleted = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="feed-layout">
      <h1 className="page-title">Explore</h1>
      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h2>No posts yet</h2>
          <p>Be the first to share something.</p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} onDeleted={handleDeleted} />)
      )}
    </div>
  );
}