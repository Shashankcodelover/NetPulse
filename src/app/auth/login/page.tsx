'use client';

// ═══════════════════════════════════════════════════════
// Login Page
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, Zap, Sparkles, Orbit, Atom } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePersonaLogin = (personaId: 'user-shashank' | 'user-alex' | 'user-elena', target = '/') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('netplus_demo_mode', 'true');
      localStorage.setItem('netpulse_active_persona', personaId);
      window.dispatchEvent(new CustomEvent('netpulse:persona-switched'));
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
    router.push(target);
    router.refresh();
  };

  const handleInstantDemoLogin = () => {
    handlePersonaLogin('user-shashank', '/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--np-bg-primary)',
      color: 'var(--np-text-primary)'
    }}>
      <header style={{ padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: 'var(--np-accent)', boxShadow: '0 0 12px var(--np-accent)'
          }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>NetPulse</h1>
        </div>
      </header>
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '48px', justifyContent: 'center' }}>
          
          <div className="animate-fade-in-up" style={{ flex: '1 1 500px', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
              Never let a good connection go cold.
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'var(--np-text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
              NetPulse is an intelligent relationship CRM designed to help professionals maintain and nurture their network. 
              By calculating deterministic decay algorithms and prioritizing outreach, it ensures you stay connected with the people who matter most.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="btn btn-primary"
                style={{ padding: '16px 32px', fontSize: '1rem', fontWeight: 700, borderRadius: '12px' }}
              >
                <Sparkles size={18} style={{ marginRight: 8 }} /> Try Demo Mode
              </button>
            </div>
          </div>

          <div className="animate-fade-in-up card" style={{ flex: '1 1 400px', maxWidth: '440px', padding: 32 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24 }}>Welcome back</h3>
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--np-radius-sm)',
                background: 'var(--np-danger-light)', color: 'var(--np-danger)',
                fontSize: '0.875rem', marginBottom: 20
              }}>
                {error}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', fontWeight: 600 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--np-text-tertiary)' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: 38, width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--np-border)', background: 'var(--np-bg-secondary)', color: 'var(--np-text-primary)' }}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--np-text-tertiary)' }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ paddingLeft: 38, width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--np-border)', background: 'var(--np-bg-secondary)', color: 'var(--np-text-primary)' }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={loading}
                style={{ width: '100%', marginTop: 12, height: 44, borderRadius: 8, fontWeight: 700 }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" style={{ marginRight: 8 }} /> : null}
                {loading ? 'Signing in...' : 'Log In'}
              </button>
            </form>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: 'var(--np-text-tertiary)', fontSize: '0.8125rem' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--np-border)' }} />
              or
              <div style={{ flex: 1, height: 1, background: 'var(--np-border)' }} />
            </div>
            <button
              onClick={handleGoogleLogin}
              className="btn"
              style={{ width: '100%', height: 44, borderRadius: 8, background: 'white', color: '#333', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--np-text-secondary)', fontSize: '0.875rem' }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" style={{ color: 'var(--np-accent)', fontWeight: 500, textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
