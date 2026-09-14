'use client';

// ═══════════════════════════════════════════════════════
// NetPulse CRM — Autonomous Executive Outreach Studio
// Flagship Multi-Archetype Copilot, Multi-Channel Dispatch,
// Web Audio Pre-Call Briefing & Social Capital Intelligence
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  CheckCircle2,
  Users,
  Building2,
  Zap,
  Check,
  RotateCcw,
  ArrowRight,
  FileText,
  Clock,
  Volume2,
  VolumeX,
  Send,
  Calendar,
  Mail,
  Share2,
  MessageSquare,
  Search,
  ChevronDown,
  Award,
  ShieldCheck,
  ExternalLink,
  Flame,
  Coffee,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';
import { calculateSocialCapitalScore } from '@/lib/scoring';
import { generateGoogleCalendarUrl } from '@/lib/calendar';
import { soundFx } from '@/lib/sound';
import type { Contact, SocialCapitalMetrics } from '@/lib/types';
import type { ExecutiveDraft } from '@/app/api/ai/draft-reply/route';
import { differenceInDays } from 'date-fns';

type ChannelTab = 'linkedin' | 'whatsapp' | 'email' | 'calendar';

function InboxContent() {
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get('contactId');
  const nameParam = searchParams.get('name');
  const contextParam = searchParams.get('context');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [contactSearch, setContactSearch] = useState<string>('');
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const [sourceText, setSourceText] = useState(contextParam || '');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [audioBriefingText, setAudioBriefingText] = useState<string | null>(null);
  const [engineSource, setEngineSource] = useState<string | null>(null);
  const [generatedDrafts, setGeneratedDrafts] = useState<ExecutiveDraft[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Multi-Channel Tabs State per draft index
  const [activeChannels, setActiveChannels] = useState<Record<number, ChannelTab>>({});

  // Audio SpeechSynthesis & Waveform State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const comboboxRef = useRef<HTMLDivElement>(null);

  // Close combobox when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setComboboxOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (contextParam) {
      setSourceText(contextParam);
    }
  }, [contextParam]);

  useEffect(() => {
    netPulseStore.getContacts().then(list => {
      setContacts(list);
      if (contactIdParam && list.some(c => c.id === contactIdParam)) {
        setSelectedContactId(contactIdParam);
      } else if (nameParam && list.some(c => c.full_name.toLowerCase().includes(nameParam.toLowerCase()))) {
        const found = list.find(c => c.full_name.toLowerCase().includes(nameParam.toLowerCase()));
        if (found) setSelectedContactId(found.id);
      } else if (list.length > 0) {
        setSelectedContactId(list[0].id);
      }
    });
  }, [contactIdParam, nameParam]);

  const selectedContact = useMemo(() => {
    return contacts.find(c => c.id === selectedContactId) || null;
  }, [contacts, selectedContactId]);

  // Social Capital Score for selected contact
  const socialCapital: SocialCapitalMetrics | null = useMemo(() => {
    if (!selectedContact) return null;
    return calculateSocialCapitalScore(selectedContact, []);
  }, [selectedContact]);

  const decayDays = useMemo(() => {
    if (!selectedContact?.last_contacted_at) return 99;
    return differenceInDays(new Date(), new Date(selectedContact.last_contacted_at));
  }, [selectedContact]);

  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(
      c =>
        c.full_name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q))
    );
  }, [contacts, contactSearch]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleGenerate = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    soundFx.buttonClick();
    try {
      const res = await fetch('/api/ai/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText,
          contactName: selectedContact?.full_name || 'Leader',
          contactRole: selectedContact?.title || 'Executive',
          contactCompany: selectedContact?.company || 'Enterprise',
          tier: selectedContact?.relationship_tier || 'priority',
          decayDays,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSummary(data.summary);
        setAudioBriefingText(data.audioBriefing);
        setEngineSource(data.source);
        setGeneratedDrafts(data.drafts);

        // Initialize channels
        const initialChannels: Record<number, ChannelTab> = {};
        data.drafts.forEach((_: any, i: number) => {
          initialChannels[i] = 'linkedin';
        });
        setActiveChannels(initialChannels);

        soundFx.positiveChime();
        showToast('Synthesized 5 Executive Archetype Drafts across all channels!');
      } else {
        showToast(data.error || 'Failed to generate drafts');
      }
    } catch {
      showToast('Network error generating executive drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundFx.buttonClick();
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleMarkReplied = async (draftText: string) => {
    if (!selectedContact) return;
    soundFx.badgeEarned();
    await netPulseStore.markContacted(selectedContact.id);
    showToast(`Logged outreach to ${selectedContact.full_name}! Relationship urgency reset to 0d.`);
  };

  const setChannelForDraft = (draftIdx: number, channel: ChannelTab) => {
    soundFx.buttonClick();
    setActiveChannels(prev => ({ ...prev, [draftIdx]: channel }));
  };

  // ═══════════════════════════════════════════════════════
  // Web SpeechSynthesis Pre-Call Executive Briefing Audio
  // ═══════════════════════════════════════════════════════
  const toggleAudioBrief = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const textToSpeak =
      audioBriefingText ||
      `Briefing for ${selectedContact?.full_name || 'Contact'}. Position: ${selectedContact?.title || 'Executive'} at ${selectedContact?.company || 'Organization'}. Relationship tier is ${selectedContact?.relationship_tier?.toUpperCase() || 'Priority'}. It has been ${decayDays} days since your last interaction. Recommended strategy is to re-engage with high respect for time and mutually aligned milestones.`;

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      startWaveformAnimation();
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      drawFlatWaveform();
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Live Canvas Waveform Animation
  const startWaveformAnimation = () => {
    let phase = 0;
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const bars = 28;
      const barWidth = width / bars - 2;

      for (let i = 0; i < bars; i++) {
        const amplitude = Math.sin(phase + i * 0.4) * 0.5 + 0.5;
        const barHeight = Math.max(4, amplitude * (height * 0.75));
        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#6366F1');
        gradient.addColorStop(1, '#A855F7');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      phase += 0.15;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const drawFlatWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const bars = 28;
    const barWidth = width / bars - 2;
    ctx.fillStyle = 'rgba(156, 163, 175, 0.4)';

    for (let i = 0; i < bars; i++) {
      const x = i * (barWidth + 2);
      const barHeight = 4;
      const y = (height - barHeight) / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    drawFlatWaveform();
  }, [summary]);

  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      {/* ═══════════════════════════════════════════════════
          HEADER & SOCIAL CAPITAL BAR
          ═══════════════════════════════════════════════════ */}
      <div className="page-header animate-fade-in" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-priority" style={{ fontSize: '0.7rem', fontWeight: 800 }}>
                EXECUTIVE STUDIO
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)', fontFamily: 'monospace' }}>
                Gemini 1.5 Flash &bull; Multi-Channel Outreach Copilot
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              Autonomous Outreach Studio
            </h1>
            <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.9rem' }}>
              Synthesize precision multi-channel outreach, monitor relationship equity, and preview audio briefings.
            </p>
          </div>

          {/* Contact Social Capital Widget */}
          {selectedContact && socialCapital && (
            <div
              className="card"
              style={{
                padding: '10px 16px',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                backgroundColor: 'var(--np-bg-secondary)',
                border: '1px solid var(--np-border)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--np-text-tertiary)', fontWeight: 700 }}>
                  Social Capital
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--np-accent)', lineHeight: 1.1 }}>
                  {socialCapital.score}
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--np-text-tertiary)' }}>/100</span>
                </div>
              </div>

              <div style={{ width: 1, height: 28, backgroundColor: 'var(--np-border)' }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor:
                        socialCapital.cadenceHealth === 'Optimal'
                          ? '#10B981'
                          : socialCapital.cadenceHealth === 'Stable'
                          ? '#3B82F6'
                          : socialCapital.cadenceHealth === 'At Risk'
                          ? '#F59E0B'
                          : '#EF4444',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{socialCapital.cadenceHealth} Cadence</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)' }}>
                  {decayDays} days since last contact
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          COMPOSER & TARGET CONNECTION PICKER
          ═══════════════════════════════════════════════════ */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 24, padding: 24, borderRadius: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
          {/* Custom Searchable Contact Combobox */}
          <div ref={comboboxRef} style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
              Target Executive Connection
            </label>

            <button
              type="button"
              onClick={() => setComboboxOpen(!comboboxOpen)}
              className="form-input"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                backgroundColor: 'var(--np-bg-secondary)',
              }}
            >
              {selectedContact ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: '#4F46E5',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {selectedContact.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.2 }}>{selectedContact.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
                      {selectedContact.title || 'Leader'} &bull; {selectedContact.company || 'Enterprise'}
                    </div>
                  </div>
                </div>
              ) : (
                <span style={{ color: 'var(--np-text-tertiary)' }}>Select a contact...</span>
              )}
              <ChevronDown size={16} style={{ color: 'var(--np-text-tertiary)', flexShrink: 0 }} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {comboboxOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    marginTop: 6,
                    backgroundColor: 'var(--np-bg-card)',
                    border: '1px solid var(--np-border)',
                    borderRadius: 12,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                    maxHeight: 280,
                    overflowY: 'auto',
                    padding: 6,
                  }}
                >
                  <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--np-border)', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Search size={14} style={{ color: 'var(--np-text-tertiary)' }} />
                      <input
                        type="text"
                        placeholder="Search by name, company, or role..."
                        value={contactSearch}
                        onChange={e => setContactSearch(e.target.value)}
                        style={{
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          fontSize: '0.82rem',
                          color: 'var(--np-text-primary)',
                        }}
                        autoFocus
                      />
                    </div>
                  </div>

                  {filteredContacts.map(c => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedContactId(c.id);
                        setComboboxOpen(false);
                        soundFx.buttonClick();
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: c.id === selectedContactId ? 'var(--np-bg-active)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.full_name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--np-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title} &bull; {c.company}
                        </div>
                      </div>
                      <span className={`badge badge-${c.relationship_tier}`} style={{ fontSize: '0.65rem' }}>
                        {c.relationship_tier}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pre-Call Audio Briefing Trigger Card */}
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              backgroundColor: 'var(--np-bg-secondary)',
              border: '1px solid var(--np-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--np-text-secondary)' }}>
                  🎧 Autonomous Audio Briefing
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', fontFamily: 'monospace' }}>
                  Web SpeechSynthesis
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--np-text-tertiary)' }}>
                Listen to a 30-second spoken executive overview of this connection before reaching out.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12 }}>
              <canvas ref={canvasRef} width={160} height={26} style={{ flexShrink: 0 }} />

              <button
                type="button"
                onClick={toggleAudioBrief}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: isPlayingAudio ? 'var(--np-accent)' : undefined,
                  color: isPlayingAudio ? '#ffffff' : undefined,
                }}
              >
                {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                {isPlayingAudio ? 'Stop Briefing' : '30s Audio Brief'}
              </button>
            </div>
          </div>
        </div>

        {/* Context Input & Preset Chips */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--np-text-secondary)' }}>
              Recent Update, Post, or Milestone Context
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSourceText('Thrilled to announce I have joined Anthropic as Research Director working on autonomous agent foundation models and multi-turn reasoning!')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                + Job Promotion
              </button>
              <button
                type="button"
                onClick={() => setSourceText('Announcing our $40M Series B financing led by Founders Fund to scale decentralized compute infrastructure for agentic workflows.')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                + Series B Round
              </button>
              <button
                type="button"
                onClick={() => setSourceText('Just released our whitepaper detailing zero-trust payload verification and deterministic edge consensus in high-throughput clusters.')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                + Research Whitepaper
              </button>
            </div>
          </div>

          <textarea
            className="form-input form-textarea"
            rows={4}
            value={sourceText}
            onChange={e => setSourceText(e.target.value)}
            placeholder="Paste their recent LinkedIn post, company acquisition announcement, tweet, or email notes..."
            style={{ width: '100%', fontSize: '0.9rem', lineHeight: 1.5 }}
          />
        </div>

        {/* Generate Trigger */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={handleGenerate}
            className="btn btn-primary"
            disabled={loading || !sourceText.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 26px',
              fontSize: '0.92rem',
              fontWeight: 800,
              borderRadius: 12,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            }}
          >
            <Sparkles size={16} />
            {loading ? 'Synthesizing 5 Executive Archetypes...' : 'Synthesize 5 Executive Archetypes'}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          EXECUTIVE SUMMARY BRIEFING CARD
          ═══════════════════════════════════════════════════ */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            marginBottom: 24,
            padding: 20,
            borderRadius: 16,
            borderLeft: '4px solid var(--np-accent)',
            backgroundColor: 'var(--np-bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--np-accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              EXECUTIVE CONTEXT SYNTHESIS
            </span>
            {engineSource && (
              <span className="badge badge-priority" style={{ fontSize: '0.68rem', fontFamily: 'monospace' }}>
                {engineSource}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--np-text-primary)', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
            {summary}
          </p>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════
          5 GENERATED EXECUTIVE OUTREACH CARDS
          ═══════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {generatedDrafts.length > 0 ? (
          generatedDrafts.map((draft, idx) => {
            const currentTab = activeChannels[idx] || 'linkedin';
            const channels = draft.channels;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="card"
                style={{
                  padding: 22,
                  borderRadius: 16,
                  border: '1px solid var(--np-border)',
                  backgroundColor: 'var(--np-bg-card)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                {/* Draft Card Top Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: 'var(--np-accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800 }}>{draft.label}</span>
                        <span className="badge badge-warm" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                          {draft.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--np-text-tertiary)', marginTop: 2 }}>
                        {draft.strategyReason}
                      </div>
                    </div>
                  </div>

                  {/* Channel Switcher Tabs */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: 'var(--np-bg-secondary)',
                      padding: 4,
                      borderRadius: 10,
                      border: '1px solid var(--np-border)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setChannelForDraft(idx, 'linkedin')}
                      className={`btn btn-sm ${currentTab === 'linkedin' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
                      title="LinkedIn Direct Message"
                    >
                      <Share2 size={13} /> LinkedIn
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannelForDraft(idx, 'whatsapp')}
                      className={`btn btn-sm ${currentTab === 'whatsapp' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
                      title="WhatsApp Direct Link"
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannelForDraft(idx, 'email')}
                      className={`btn btn-sm ${currentTab === 'email' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
                      title="Executive Email Format"
                    >
                      <Mail size={13} /> Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannelForDraft(idx, 'calendar')}
                      className={`btn btn-sm ${currentTab === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
                      title="15-min Calendar Catch-up Agenda"
                    >
                      <Calendar size={13} /> 15m Call
                    </button>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════
                    ACTIVE CHANNEL PREVIEW & ACTIONS
                    ═══════════════════════════════════════════ */}
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: 'var(--np-bg-secondary)',
                    border: '1px solid var(--np-border)',
                    marginBottom: 14,
                  }}
                >
                  {/* LinkedIn Tab Preview */}
                  {currentTab === 'linkedin' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                          LinkedIn Message / InMail Preview
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: channels.linkedin.charCount > 300 ? '#EF4444' : 'var(--np-text-secondary)',
                            }}
                          >
                            {channels.linkedin.charCount} / 300 chars
                          </span>
                          {channels.linkedin.fitsConnectionNote ? (
                            <span className="badge badge-cold" style={{ fontSize: '0.62rem' }}>
                              Fits Connect Note
                            </span>
                          ) : (
                            <span className="badge badge-priority" style={{ fontSize: '0.62rem' }}>
                              InMail / DM
                            </span>
                          )}
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--np-text-primary)', lineHeight: 1.6 }}>
                        {channels.linkedin.text}
                      </p>
                    </div>
                  )}

                  {/* WhatsApp Tab Preview */}
                  {currentTab === 'whatsapp' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                          WhatsApp Conversational Preview
                        </span>
                        <span className="badge badge-warm" style={{ fontSize: '0.65rem' }}>
                          Mobile Friendly
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--np-text-primary)', lineHeight: 1.6 }}>
                        {channels.whatsapp.text}
                      </p>
                    </div>
                  )}

                  {/* Email Tab Preview */}
                  {currentTab === 'email' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '1px solid var(--np-border)' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--np-text-tertiary)', width: 60 }}>
                          Subject:
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--np-text-primary)' }}>
                          {channels.email.subject}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--np-text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {channels.email.body}
                      </p>
                    </div>
                  )}

                  {/* Calendar Catch-up Agenda Tab */}
                  {currentTab === 'calendar' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, borderBottom: '1px solid var(--np-border)' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--np-text-tertiary)', width: 60 }}>
                          Event:
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--np-text-primary)' }}>
                          {channels.calendar.title} (15 mins)
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--np-text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {channels.calendar.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Draft Bottom Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Copy Active Text */}
                    <button
                      onClick={() => {
                        const textToCopy =
                          currentTab === 'email'
                            ? `Subject: ${channels.email.subject}\n\n${channels.email.body}`
                            : currentTab === 'whatsapp'
                            ? channels.whatsapp.text
                            : currentTab === 'calendar'
                            ? `${channels.calendar.title}\n\n${channels.calendar.description}`
                            : channels.linkedin.text;
                        handleCopy(textToCopy, `${idx}-${currentTab}`);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
                    >
                      {copiedKey === `${idx}-${currentTab}` ? <Check size={13} style={{ color: 'var(--np-success)' }} /> : <Copy size={13} />}
                      {copiedKey === `${idx}-${currentTab}` ? 'Copied!' : 'Copy to Clipboard'}
                    </button>

                    {/* Direct Channel Deep-Link Dispatch */}
                    {currentTab === 'whatsapp' && (
                      <a
                        href={channels.whatsapp.encodedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
                      >
                        <ExternalLink size={13} /> Open WhatsApp
                      </a>
                    )}

                    {currentTab === 'email' && (
                      <a
                        href={channels.email.mailtoUrl}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
                      >
                        <ExternalLink size={13} /> Open Mail Client
                      </a>
                    )}

                    {currentTab === 'calendar' && selectedContact && (
                      <a
                        href={generateGoogleCalendarUrl({
                          contact: selectedContact,
                          agendaTopic: `Catch-up: ${draft.label}`,
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
                      >
                        <Calendar size={13} /> Create Google Invite
                      </a>
                    )}
                  </div>

                  {/* Mark Replied & Reset Urgency Clock */}
                  <button
                    onClick={() => handleMarkReplied(draft.text)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 800 }}
                  >
                    <CheckCircle2 size={14} /> Mark Reached &amp; Reset Clock
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--np-text-tertiary)',
              border: '1px dashed var(--np-border)',
              borderRadius: 16,
              fontSize: '0.9rem',
              backgroundColor: 'var(--np-bg-secondary)',
            }}
          >
            <Sparkles size={36} style={{ margin: '0 auto 14px', opacity: 0.6, color: 'var(--np-accent)' }} />
            <div style={{ fontWeight: 700, color: 'var(--np-text-primary)', marginBottom: 4, fontSize: '1rem' }}>
              No Executive Drafts Synthesized Yet
            </div>
            Select an executive connection above and click &quot;Synthesize 5 Executive Archetypes&quot; to generate multi-channel outreach options.
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="toast"
            style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 100 }}
          >
            <CheckCircle2 size={16} style={{ color: 'var(--np-success)' }} />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="page-container"><div className="skeleton" style={{ height: 320, borderRadius: 16 }} /></div>}>
      <InboxContent />
    </Suspense>
  );
}
