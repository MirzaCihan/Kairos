import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import './AuthView.css';

export default function ForgotPasswordView({ onNavigate }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Password reset link sent! Check your email inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
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

          <h2 className="auth-card__title">Reset your password</h2>
          <p className="auth-card__subtitle">
            Enter your email and we'll send you a reset link
          </p>

          {error && (
            <div className="auth-message auth-message--error">{error}</div>
          )}
          {success && (
            <div className="auth-message auth-message--success">{success}</div>
          )}

          {!success && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="reset-email">Email</label>
                <input
                  id="reset-email"
                  className="auth-form__input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className="auth-form__submit"
                disabled={loading}
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="auth-card__footer">
            Remember your password?{' '}
            <button className="auth-card__link" onClick={() => onNavigate('login')}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
