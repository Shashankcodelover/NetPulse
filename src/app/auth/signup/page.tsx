'use client';

// ═══════════════════════════════════════════════════════
// Sign Up Page
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24, background: 'var(--np-bg-primary)',
      }}>
        <div className="card animate-scale-in" style={{ maxWidth: 420, width: '100%' }}>
          <div className="card-body" style={{ padding: 40, textAlign: 'center' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--np-success)', marginBottom: 16 }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
            <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.9375rem', marginBottom: 24 }}>
              We&apos;ve sent a verification link to <strong>{email}</strong>.
              Click it to activate your account.
            </p>
            <Link href="/auth/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24, background: 'var(--np-bg-primary)',
    }}>
      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: 'var(--np-accent)', boxShadow: '0 0 12px var(--np-accent)',
            }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>NetPulse</h1>
          </div>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.9375rem' }}>
            Start managing your network like a pro
          </p>
        </div>

        <div className="card">
          <div className="card-body" style={{ padding: 32 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24 }}>Create your account</h2>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--np-radius-sm)',
                background: 'var(--np-danger-light)', color: 'var(--np-danger)',
                fontSize: '0.875rem', marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--np-text-tertiary)' }} />
                  <input type="text" className="form-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required style={{ paddingLeft: 38 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--np-text-tertiary)' }} />
                  <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: 38 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--np-text-tertiary)' }} />
                  <input type="password" className="form-input" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ paddingLeft: 38 }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: 'var(--np-text-tertiary)', fontSize: '0.8125rem' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--np-border)' }} />
              or
              <div style={{ flex: 1, height: 1, background: 'var(--np-border)' }} />
            </div>

            <button onClick={handleGoogleSignup} className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--np-text-secondary)', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--np-accent)', fontWeight: 500, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
