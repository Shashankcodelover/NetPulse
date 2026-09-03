'use client';

// ═══════════════════════════════════════════════════════
// Sidebar Navigation
// ═══════════════════════════════════════════════════════

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Zap,
  Users,
  Upload,
  Inbox,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  Kanban,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/notification-bell';

const navItems = [
  { href: '/', label: 'Digest', icon: Zap },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/import', label: 'Import', icon: Upload },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="btn-ghost"
            style={{ padding: 8 }}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="logo-dot" style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--np-accent)', boxShadow: '0 0 8px var(--np-accent)'
            }} />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>NetPulse</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <NotificationBell />
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Close button (mobile) */}
        <div style={{
          display: 'none',
          position: 'absolute', top: 12, right: 12,
        }} className="mobile-close">
          <button
            onClick={() => setMobileOpen(false)}
            className="btn-ghost"
            style={{ padding: 6 }}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Logo */}
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="logo-dot" />
            <h1>NetPulse</h1>
          </div>
          <NotificationBell />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={isActive(href) ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          {/* Judge & Sandbox Simulator Trigger */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--np-border)' }}>
            <button
              onClick={() => {
                setMobileOpen(false);
                window.dispatchEvent(new CustomEvent('netpulse:open-simulator'));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px dashed #38bdf8',
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <Kanban size={16} />
              <span>Decay Simulator</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.65rem', backgroundColor: '#0284c7', color: '#fff', padding: '1px 5px', borderRadius: '6px' }}>
                JUDGE
              </span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleSignOut}
            className="btn-ghost btn-sm"
            style={{ gap: 6 }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
