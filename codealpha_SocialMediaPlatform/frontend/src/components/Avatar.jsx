import { imageSrc } from '../api';

export default function Avatar({ src, name, size = 40 }) {
  const url = imageSrc(src);
  const initial = (name || '?').charAt(0).toUpperCase();

  return url ? (
    <img
      src={url}
      alt={name}
      className="avatar"
      style={{ width: size, height: size }}
    />
  ) : (
    <div className="avatar avatar-ph" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initial}
    </div>
  );
}