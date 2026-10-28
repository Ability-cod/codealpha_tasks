import { useEffect, useState } from 'react';
import { api, timeAgo } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const messageFor = (n) => {
  if (n.type === 'assigned') return `assigned you to "${n.task_title}"`;
  if (n.type === 'comment') return `commented on "${n.task_title}"`;
  if (n.type === 'added_to_project') return `added you to "${n.project_name}"`;
  return `moved a task in "${n.project_name}"`;
};

export default function Notifications() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/notifications', { token }).then(setItems).finally(() => setLoading(false));
    api('/notifications/mark-read', { method: 'PUT', token }).catch(() => {});
  }, [token]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="feed-layout">
      <h1 className="page-title">Notifications</h1>
      {items.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing yet</h2>
          <p>Assignments, comments, and project invites will show up here.</p>
        </div>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          {items.map((n) => (
            <div key={n.id} className={`notif-row ${n.is_read ? '' : 'unread'}`}>
              <Avatar src={n.actor_avatar} name={n.actor_name} size={40} />
              <p><strong>{n.actor_name}</strong> {messageFor(n)}</p>
              <span>{timeAgo(n.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}