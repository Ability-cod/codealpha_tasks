import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!token) return;
    const load = () =>
      api('/notifications/unread-count', { token })
        .then((data) => setUnread(data.count))
        .catch(() => {});
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      api(`/users/search?q=${encodeURIComponent(query)}`, { token })
        .then(setResults)
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToProfile = (username) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    navigate(`/profile/${username}`);
  };

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">P</span>
          <span>
            Pulse <span className="brand-light">Connect</span>
          </span>
        </Link>

        <div className="search-wrap">
          <input
            className="input search-input"
            placeholder="Search people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
          />
          {showResults && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((r) => (
                <button key={r.id} className="search-result" onMouseDown={() => goToProfile(r.username)}>
                  <Avatar src={r.avatar_url} name={r.name} size={32} />
                  <div>
                    <strong>{r.name}</strong>
                    <span>@{r.username}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="nav-links">
          <NavLink to="/" end>Feed</NavLink>
          <NavLink to="/explore">Explore</NavLink>
          <NavLink to="/notifications" className="nav-notif">
            Notifications
            {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
          </NavLink>
        </nav>

        <div className="nav-actions">
          <Link to={`/profile/${user.username}`} className="user-chip">
            <Avatar src={user.avatar_url} name={user.name} size={30} />
            <span>{user.name.split(' ')[0]}</span>
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </header>
  );
}