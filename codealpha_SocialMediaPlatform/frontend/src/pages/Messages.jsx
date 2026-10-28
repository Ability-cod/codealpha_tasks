import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, imageSrc, timeAgo } from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Avatar from '../components/Avatar';

export default function Messages() {
  const { username } = useParams();
  const { user, token } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadConversations = () => {
    api('/messages/conversations', { token }).then(setConversations).catch(() => {});
  };

  useEffect(() => {
    loadConversations();
  }, [token]);

  useEffect(() => {
    if (!username) {
      setMessages([]);
      return;
    }
    api(`/messages/${username}`, { token })
      .then(setMessages)
      .then(loadConversations);
  }, [username, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handler = (message) => {
      loadConversations();
      const activeUser = conversations.find((c) => c.username === username);
      if (activeUser && message.sender_id === activeUser.id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, username, conversations]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;

    setSending(true);
    setText('');
    try {
      const message = await api(`/messages/${username}`, { method: 'POST', token, body: { content } });
      setMessages((prev) => [...prev, message]);
      loadConversations();
    } catch (err) {
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.username === username);

  return (
    <div className="messages-layout">
      <aside className="conversation-list">
        <h2 className="page-title" style={{ padding: '0 4px' }}>Messages</h2>
        {conversations.length === 0 ? (
          <p className="muted" style={{ padding: '0 4px' }}>No conversations yet.</p>
        ) : (
          conversations.map((c) => (
            <Link
              key={c.id}
              to={`/messages/${c.username}`}
              className={`conversation-item ${c.username === username ? 'active' : ''}`}
            >
              <Avatar src={c.avatar_url} name={c.name} size={44} />
              <div className="conversation-info">
                <strong>{c.name}</strong>
                <span>{c.last_sender_id === user.id ? 'You: ' : ''}{c.last_message}</span>
              </div>
              {c.unread_count > 0 && <span className="notif-badge">{c.unread_count}</span>}
            </Link>
          ))
        )}
      </aside>

      <section className="chat-panel">
        {!username ? (
          <div className="empty-state" style={{ margin: 'auto' }}>
            <h2>Select a conversation</h2>
            <p>Choose someone from the list to start chatting.</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <Avatar src={activeConversation?.avatar_url} name={activeConversation?.name || username} size={36} />
              <strong>{activeConversation?.name || username}</strong>
            </div>

            <div className="chat-messages">
              {messages.map((m) => (
                <div key={m.id} className={`chat-bubble ${m.sender_id === user.id ? 'mine' : ''}`}>
                  <p>{m.content}</p>
                  <span>{timeAgo(m.created_at)}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form className="chat-input" onSubmit={handleSend}>
              <input
                className="input"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="btn btn-sm" disabled={sending || !text.trim()}>Send</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}