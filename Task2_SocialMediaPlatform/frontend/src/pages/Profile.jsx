import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, imageSrc } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';

export default function Profile() {
  const { username } = useParams();
  const { token, user: currentUser } = useAuth();
  const { notify } = useToast();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followBusy, setFollowBusy] = useState(false);

  const loadProfile = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api(`/users/${username}`, { token }),
      api(`/posts/user/${username}`, { token })
    ])
      .then(([profileData, postData]) => {
        setProfile(profileData);
        setPosts(postData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username, token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const toggleFollow = async () => {
    setFollowBusy(true);
    try {
      await api(`/users/${username}/follow`, {
        method: profile.isFollowing ? 'DELETE' : 'POST',
        token
      });
      setProfile((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        followerCount: prev.followerCount + (prev.isFollowing ? -1 : 1)
      }));
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setFollowBusy(false);
    }
  };

  const handleDeleted = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setProfile((prev) => ({ ...prev, postCount: prev.postCount - 1 }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div className="empty-state">
        <h2>{error}</h2>
        <Link to="/" className="btn">Back to feed</Link>
      </div>
    );
  }

  const isSelf = profile.id === currentUser.id;
  const avatarSrc = imageSrc(profile.avatar_url);

  return (
    <div className="feed-layout">
      <div className="profile-header">
        <Avatar src={profile.avatar_url} name={profile.name} size={96} />
        <div className="profile-info">
          <div className="profile-top">
            <div>
              <h1>{profile.name}</h1>
              <span className="profile-username">@{profile.username}</span>
            </div>
            {isSelf ? (
              <Link to="/settings/profile" className="btn btn-ghost btn-sm">Edit profile</Link>
            ) : (
              <button
                className={`btn btn-sm ${profile.isFollowing ? 'btn-ghost' : ''}`}
                onClick={toggleFollow}
                disabled={followBusy}
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="profile-stats">
            <span><strong>{profile.postCount}</strong> posts</span>
            <span><strong>{profile.followerCount}</strong> followers</span>
            <span><strong>{profile.followingCount}</strong> following</span>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h2>No posts yet</h2>
          {isSelf && <p>Share your first post from the feed page.</p>}
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} onDeleted={handleDeleted} />)
      )}
    </div>
  );
}