import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [stage, setStage] = useState('credentials');
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: form });
      if (data.requires2FA) {
        setTempToken(data.tempToken);
        setStage('twoFactor');
      } else {
        login(data.user, data.token);
        notify(`Welcome back, ${data.user.name.split(' ')[0]}!`);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/verify-2fa', {
        method: 'POST',
        body: { tempToken, code }
      });
      login(data.user, data.token);
      notify(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (stage === 'twoFactor') {
    return (
      <div className="auth-screen">
        <form className="auth-card" onSubmit={handleVerify}>
          <div className="auth-brand">
            <span className="brand-mark">P</span>
            <span>Pulse Connect</span>
          </div>
          <p className="sub">Enter the 6-digit code from your authenticator app.</p>
          {error && <div className="alert error">{error}</div>}

          <div className="field">
            <label htmlFor="code">Authentication code</label>
            <input
              id="code"
              className="input code-input"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />
          </div>

          <button className="btn btn-block" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify and log in'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => {
              setStage('credentials');
              setCode('');
              setError('');
            }}
          >
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleCredentials}>
        <div className="auth-brand">
          <span className="brand-mark">P</span>
          <span>Pulse Connect</span>
        </div>
        <p className="sub">Log in to see what's happening.</p>
        {error && <div className="alert error">{error}</div>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>

        <button className="btn btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p className="switch">New to Pulse Connect? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}