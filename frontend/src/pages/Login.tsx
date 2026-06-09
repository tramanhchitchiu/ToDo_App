import React, { useState } from 'react';
import styles from './Login.module.css';

interface LoginProps {
  onLogin?: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError('');

    try {
      // Phase 1: mock login — accept any non-empty credentials
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (email && password) {
        onLogin?.();
      } else {
        setError('Invalid email or password.');
      }
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSso = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin?.();
    }, 600);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}>
          <h1 className={styles.appName}>🤱 Task Mom 24/7</h1>
          <p className={styles.tagline}>không quên · không giận · không hối</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@fpt.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <button
            type="submit"
            className={`${styles.signInBtn}${loading ? ` ${styles.loading}` : ''}`}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine} />
        </div>

        <button type="button" className={styles.ssoBtn} onClick={handleSso}>
          Sign in with FPT SSO
        </button>
      </div>
    </div>
  );
}

export default Login;
