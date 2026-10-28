import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';

export default function Feed() {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api('/posts/feed', { token })
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
      <PostComposer onPosted={load} />

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h2>Your feed is quiet</h2>
          <p>Follow people to see their posts here.</p>
          <Link to="/explore" className="btn">Explore people</Link>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} onDeleted={handleDeleted} />)
      )}
    </div>
  );
}