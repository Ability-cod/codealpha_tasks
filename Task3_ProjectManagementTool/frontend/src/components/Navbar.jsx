import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    const load = () =>
      api('/notifications/unread-count', { token }).then((data) => setUnread(data.count)).catch(() => {});
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [token]);

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

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">T</span>
          <span>Taskly</span>
        </Link>

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
                <Link to="/settings/profile" onClick={() => setMenuOpen(false)}>Edit profile</Link>
                <button className="dropdown-item danger" onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}