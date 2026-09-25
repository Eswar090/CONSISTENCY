import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate flow without claiming an email was sent since SMTP is not configured in dev
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-dark, #0f172a)',
      color: 'var(--text-main, #f8fafc)',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--card-bg, #1e293b)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #334155)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#6366f1' }}>Forgot Password?</h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
            Enter your registered email address and we'll help you reset your password.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid #6366f1',
              color: '#818cf8',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              Password reset requested for <strong>{email}</strong>.
              <br />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.5rem' }}>
                (Note: Email delivery service is not configured in this development environment.)
              </span>
            </div>
            <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #334155)',
                  backgroundColor: 'var(--input-bg, #0f172a)',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#6366f1',
                color: '#fff',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'background-color 0.2s',
                marginBottom: '1.5rem'
              }}
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
              <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
