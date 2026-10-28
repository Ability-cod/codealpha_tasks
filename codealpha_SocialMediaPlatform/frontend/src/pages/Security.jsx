import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Security() {
  const { user, token, updateUser } = useAuth();
  const { notify } = useToast();

  const [stage, setStage] = useState('idle');
  const [qrCode, setQrCode] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const twoFactorEnabled = Boolean(user.two_factor_enabled);

  const startSetup = async () => {
    setError('');
    setBusy(true);
    try {
      const data = await api('/auth/2fa/setup', { method: 'POST', token });
      setQrCode(data.qrCode);
      setManualKey(data.manualKey);
      setStage('setup');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/auth/2fa/confirm', { method: 'POST', token, body: { code } });
      updateUser({ two_factor_enabled: true });
      notify('Two-factor authentication enabled');
      setStage('idle');
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const disable2FA = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/auth/2fa/disable', { method: 'POST', token, body: { password } });
      updateUser({ two_factor_enabled: false });
      notify('Two-factor authentication disabled');
      setStage('idle');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel form-stack" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2>Security</h2>

      <div className="security-row">
        <div>
          <strong>Two-factor authentication</strong>
          <p className="muted">
            {twoFactorEnabled
              ? 'Enabled. You will need an authentication code each time you log in.'
              : 'Add an extra layer of security using an authenticator app.'}
          </p>
        </div>
        <span className={`badge ${twoFactorEnabled ? 'paid' : 'unpaid'}`}>
          {twoFactorEnabled ? 'On' : 'Off'}
        </span>
      </div>

      {error && <div className="alert error">{error}</div>}

      {stage === 'idle' && !twoFactorEnabled && (
        <button className="btn" onClick={startSetup} disabled={busy}>
          {busy ? 'Starting...' : 'Enable two-factor authentication'}
        </button>
      )}

      {stage === 'idle' && twoFactorEnabled && (
        <form className="form-stack" onSubmit={disable2FA}>
          <div className="field">
            <label htmlFor="disable-password">Confirm your password to disable</label>
            <input
              id="disable-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-danger" disabled={busy}>
            {busy ? 'Disabling...' : 'Disable two-factor authentication'}
          </button>
        </form>
      )}

      {stage === 'setup' && (
        <form className="form-stack" onSubmit={confirmSetup}>
          <p>Scan this QR code with Google Authenticator, or enter the key manually.</p>
          <img src={qrCode} alt="Two-factor setup QR code" className="qr-code" />
          <div className="field">
            <label>Manual key</label>
            <input className="input" readOnly value={manualKey} />
          </div>
          <div className="field">
            <label htmlFor="confirm-code">Enter the 6-digit code to confirm</label>
            <input
              id="confirm-code"
              className="input code-input"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <button className="btn" disabled={busy || code.length !== 6}>
            {busy ? 'Confirming...' : 'Confirm and enable'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setStage('idle');
              setCode('');
            }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}