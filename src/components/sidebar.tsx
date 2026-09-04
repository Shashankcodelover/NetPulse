'use client';

// ═══════════════════════════════════════════════════════
// Sidebar Navigation (Polished UI/UX)
// Animated active indicators with framer-motion layoutId,
// glassmorphism depth, and clean micro-interactions.
// ═══════════════════════════════════════════════════════

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Sparkles,
  Compass,
  Search,
  Share2,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/notification-bell';

const navItems = [
  { href: '/', label: 'Digest', icon: Zap },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/graph', label: 'Graph', icon: Share2 },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/radar', label: 'Radar', icon: Compass },
  { href: '/triage', label: 'Triage', icon: Sparkles },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="btn-ghost"
            style={{ padding: 8 }}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              className="logo-dot"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--np-accent)',
                boxShadow: '0 0 10px var(--np-accent)',
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>NetPulse</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <NotificationBell placement="header" />
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Mobile Close Button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="btn-ghost"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              padding: 6,
              borderRadius: '50%',
              zIndex: 10,
            }}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        )}

        {/* Logo */}
        <div
          className="sidebar-logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'var(--np-accent)',
                boxShadow: '0 0 12px var(--np-accent)',
              }}
            />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              NetPulse
            </h1>
          </div>
          <NotificationBell placement="sidebar" />
        </div>

        {/* Omnibar / Command Palette Trigger */}
        <div style={{ padding: '0 12px 14px' }}>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('netpulse:open-command-palette'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '9px',
              backgroundColor: 'var(--np-bg-tertiary)',
              border: '1px solid var(--np-border)',
              color: 'var(--np-text-tertiary)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Quick search or jump (Ctrl + K)"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={14} /> Search or jump...
            </span>
            <kbd
              style={{
                fontSize: '0.66rem',
                padding: '1px 6px',
                borderRadius: 4,
                background: 'var(--np-bg-card)',
                border: '1px solid var(--np-border)',
                color: 'var(--np-text-secondary)',
                fontWeight: 700,
              }}
            >
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Navigation List with Floating Active Pill */}
        <nav className="sidebar-nav" style={{ position: 'relative' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 14px',
                  borderRadius: '8px',
                  color: active ? 'var(--np-accent)' : 'var(--np-text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: active ? 700 : 500,
                  transition: 'color 0.15s ease',
                  zIndex: 1,
                }}
              >
                {active && (
                  <motion.div
                    layoutId="activeNavPill"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'var(--np-bg-active)',
                      borderRadius: '8px',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </Link>
            );
          })}

          {/* Time-Travel Decay Simulator Trigger */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--np-border)' }}>
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
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.06)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <Kanban size={15} />
              <span>Decay Simulator</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.62rem',
                  backgroundColor: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontWeight: 800,
                }}
              >
                SANDBOX
              </span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div
          className="sidebar-footer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
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
            style={{ gap: 6, fontSize: '0.8rem' }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
