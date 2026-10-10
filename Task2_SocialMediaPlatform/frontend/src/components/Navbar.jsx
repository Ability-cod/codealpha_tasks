import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [unread, setUnread] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const load = () => {
      api('/notifications/unread-count', { token }).then((data) => setUnread(data.count)).catch(() => {});
      api('/messages/unread-count', { token }).then((data) => setUnreadMessages(data.count)).catch(() => {});
    };
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

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
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
          <NavLink to="/messages" className="nav-notif">
            Messages
            {unreadMessages > 0 && <span className="notif-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>}
          </NavLink>
        </nav>

        <div className="nav-actions">
          <Link to="/notifications" className="bell-button" aria-label="Notifications">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unread > 0 && <span className="bell-badge">{unread > 9 ? '9+' : unread}</span>}
          </Link>

          <div className="profile-menu" ref={menuRef}>
            <button className="user-chip" onClick={() => setMenuOpen((prev) => !prev)}>
              <Avatar src={user.avatar_url} name={user.name} size={32} />
              <span>{user.name.split(' ')[0]}</span>
            </button>

            {menuOpen && (
              <div className="profile-dropdown">
                <Link to={`/profile/${user.username}`} onClick={() => setMenuOpen(false)}>View profile</Link>
                <Link to="/settings/profile" onClick={() => setMenuOpen(false)}>Edit profile</Link>
                <Link to="/settings/security" onClick={() => setMenuOpen(false)}>Security</Link>
                <button className="dropdown-item" onClick={toggleTheme}>
                  {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                </button>
                <button className="dropdown-item danger" onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}