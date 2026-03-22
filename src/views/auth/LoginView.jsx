import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import './AuthView.css';

export default function LoginView({ onNavigate }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
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

          <h2 className="auth-card__title">Welcome back</h2>
          <p className="auth-card__subtitle">Sign in to access your planner</p>

          {error && (
            <div className="auth-message auth-message--error">{error}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__group">
              <label className="auth-form__label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
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
              <label className="auth-form__label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="auth-form__input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <span className="auth-card__forgot-link">
                <button
                  type="button"
                  className="auth-card__link"
                  onClick={() => onNavigate('forgot-password')}
                >
                  Forgot password?
                </button>
              </span>
            </div>

            <button
              type="submit"
              className="auth-form__submit"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-card__footer">
            Don't have an account?{' '}
            <button className="auth-card__link" onClick={() => onNavigate('register')}>
              Create one
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
