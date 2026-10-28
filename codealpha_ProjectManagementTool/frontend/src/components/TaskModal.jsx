import { useEffect, useState } from 'react';
import { api, formatDate, timeAgo } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';

export default function TaskModal({ task, members, onClose, onUpdated, onDeleted }) {
  const { user, token } = useAuth();
  const { notify } = useToast();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assigneeId, setAssigneeId] = useState(task.assignee_id || '');
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.slice(0, 10) : '');
  const [priority, setPriority] = useState(task.priority);
  const [saving, setSaving] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    api(`/tasks/${task.id}/comments`, { token }).then(setComments);
  }, [task.id, token]);

  const handleSave = async () => {
    if (!title.trim()) {
      notify('Title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      await api(`/tasks/${task.id}`, {
        method: 'PUT',
        token,
        body: {
          title: title.trim(),
          description: description.trim(),
          assigneeId: assigneeId || null,
          dueDate: dueDate || null,
          priority
        }
      });
      notify('Task updated');
      onUpdated();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api(`/tasks/${task.id}`, { method: 'DELETE', token });
      notify('Task deleted');
      onDeleted();
      onClose();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    try {
      const comment = await api(`/tasks/${task.id}/comments`, { method: 'POST', token, body: { content: text } });
      setComments((prev) => [...prev, comment]);
      setCommentText('');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api(`/tasks/${task.id}/comments/${commentId}`, { method: 'DELETE', token });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <input className="input task-title-input" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Description</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more detail..." />
          </div>

          <div className="form-row">
            <div className="field">
              <label>Assignee</label>
              <select className="select" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Due date</label>
            <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="row-actions">
            <button className="btn btn-sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete task</button>
          </div>

          <div className="comments">
            <h4>Comments</h4>
            {comments.map((c) => (
              <div key={c.id} className="comment">
                <Avatar src={c.author_avatar} name={c.author_name} size={28} />
                <div className="comment-body">
                  <div className="comment-bubble">
                    <strong className="comment-author">{c.author_name}</strong>
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
              <Avatar src={user.avatar_url} name={user.name} size={28} />
              <input
                className="input"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button className="btn btn-sm" disabled={!commentText.trim()}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}