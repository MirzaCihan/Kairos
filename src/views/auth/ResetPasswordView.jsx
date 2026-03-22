import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import './AuthView.css';

export default function ResetPasswordView({ onNavigate }) {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess('Password updated! Redirecting to your planner…');
      setTimeout(() => {
        window.location.hash = '';
        onNavigate('app');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__logo">
            <img src="/logo.png" alt="Kairos" />
            <h1>Kairos</h1>
            <p>Master Your Day</p>
          </div>

          <h2 className="auth-card__title">Set new password</h2>
          <p className="auth-card__subtitle">Choose a strong password for your account</p>

          {error && (
            <div className="auth-message auth-message--error">{error}</div>
          )}
          {success && (
            <div className="auth-message auth-message--success">{success}</div>
          )}

          {!success && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  className="auth-form__input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="confirm-new-password">Confirm New Password</label>
                <input
                  id="confirm-new-password"
                  className="auth-form__input"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="auth-form__submit"
                disabled={loading}
              >
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}

          <div className="auth-card__footer">
            <button className="auth-card__link" onClick={() => onNavigate('login')}>
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
