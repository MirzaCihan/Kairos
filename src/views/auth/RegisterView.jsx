import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import './AuthView.css';

export default function RegisterView({ onNavigate }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
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
      await signUp(email, password);
      setSuccess('Account created! Check your email inbox for a confirmation link.');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
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

          <h2 className="auth-card__title">Create your account</h2>
          <p className="auth-card__subtitle">Start organizing your day with Kairos</p>

          {error && (
            <div className="auth-message auth-message--error">{error}</div>
          )}
          {success && (
            <div className="auth-message auth-message--success">{success}</div>
          )}

          {!success && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  className="auth-form__input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-form__group">
                <label className="auth-form__label" htmlFor="register-password">Password</label>
                <input
                  id="register-password"
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
                <label className="auth-form__label" htmlFor="register-confirm">Confirm Password</label>
                <input
                  id="register-confirm"
                  className="auth-form__input"
                  type="password"
                  placeholder="Re-enter your password"
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
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="auth-card__footer">
            Already have an account?{' '}
            <button className="auth-card__link" onClick={() => onNavigate('login')}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
