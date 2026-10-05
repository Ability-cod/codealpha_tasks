import { useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';

export default function PostComposer({ onPosted }) {
  const { user, token } = useAuth();
  const { notify } = useToast();
  const fileRef = useRef(null);

  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaKind, setMediaKind] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posting, setPosting] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      notify('Please choose an image or video file', 'error');
      return;
    }
    if (isVideo && file.size > 50 * 1024 * 1024) {
      notify('Video must be smaller than 50MB', 'error');
      return;
    }

    setMediaFile(file);
    setMediaKind(isVideo ? 'video' : 'image');
    setPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaKind(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) {
      notify('Write something or add media', 'error');
      return;
    }

    setPosting(true);
    const body = new FormData();
    body.append('content', content.trim());
    if (mediaFile) body.append('image', mediaFile);

    try {
      await api('/posts', { method: 'POST', token, body });
      setContent('');
      clearMedia();
      notify('Post shared');
      onPosted();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <Avatar src={user.avatar_url} name={user.name} size={44} />
      <div className="composer-body">
        <textarea
          className="input composer-input"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
        />
        {preview && (
          <div className="composer-preview">
            {mediaKind === 'video' ? (
              <video src={preview} controls />
            ) : (
              <img src={preview} alt="Preview" />
            )}
            <button type="button" className="preview-remove" onClick={clearMedia}>×</button>
          </div>
        )}
        <div className="composer-actions">
          <label className="composer-upload">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={handleFile} hidden />
          </label>
          <button className="btn btn-sm" disabled={posting}>
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}