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
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [posting, setPosting] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Please choose an image file', 'error');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      notify('Write something or add an image', 'error');
      return;
    }

    setPosting(true);
    const body = new FormData();
    body.append('content', content.trim());
    if (imageFile) body.append('image', imageFile);

    try {
      await api('/posts', { method: 'POST', token, body });
      setContent('');
      clearImage();
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
            <img src={preview} alt="Preview" />
            <button type="button" className="preview-remove" onClick={clearImage}>×</button>
          </div>
        )}
        <div className="composer-actions">
          <label className="composer-upload">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />
          </label>
          <button className="btn btn-sm" disabled={posting}>
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );
}