import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, imageSrc } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';

export default function EditProfile() {
  const { user, token, updateUser } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(imageSrc(user.avatar_url));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    const body = new FormData();
    body.append('name', name.trim());
    body.append('bio', bio.trim());
    if (avatarFile) body.append('avatar', avatarFile);

    try {
      await api('/users/me/profile', { method: 'PUT', token, body });
      updateUser({ name: name.trim(), bio: bio.trim(), ...(avatarFile ? { avatar_url: preview } : {}) });
      notify('Profile updated');
      navigate(`/profile/${user.username}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel form-stack" style={{ maxWidth: 480, margin: '0 auto' }} onSubmit={handleSubmit}>
      <h2>Edit profile</h2>
      {error && <div className="alert error">{error}</div>}

      <div className="field" style={{ alignItems: 'center' }}>
        <label className="avatar-upload" onClick={() => fileRef.current.click()}>
          <Avatar src={preview} name={name} size={88} />
          <span>Change photo</span>
        </label>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />
      </div>

      <div className="field">
        <label htmlFor="e-name">Name</label>
        <input id="e-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="field">
        <label htmlFor="e-bio">Bio</label>
        <textarea id="e-bio" className="input" rows={3} maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)} />
        <span className="char-count">{bio.length}/280</span>
      </div>

      <button className="btn btn-block" disabled={saving}>
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}