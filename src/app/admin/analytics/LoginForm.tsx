'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        router.refresh();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.icon}>🔒</div>
        <h1 style={styles.title}>Admin Analytics</h1>
        <p style={styles.subtitle}>Enter the admin password to continue</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading || !password} style={styles.btn}>
          {loading ? 'Verifying...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F5F7F9',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '48px 40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    textAlign: 'center' as const,
  },
  icon: {
    fontSize: '32px',
    marginBottom: '16px',
  },
  title: {
    fontFamily: 'var(--font-h)',
    fontSize: '22px',
    fontWeight: 700,
    color: '#222',
    margin: '0 0 6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 28px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '1.5px solid #E8ECF1',
    borderRadius: '10px',
    outline: 'none',
    fontFamily: 'var(--font-b)',
    marginBottom: '12px',
    transition: 'border-color 0.2s',
  },
  error: {
    color: '#F87171',
    fontSize: '13px',
    margin: '0 0 12px',
    fontWeight: 500,
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: '#26BE81',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: 'var(--font-h)',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.2s',
  },
};
