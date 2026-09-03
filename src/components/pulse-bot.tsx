'use client';

// ═══════════════════════════════════════════════════════
// PulseBot — Autonomous AI Networking Copilot
// Microsoft Imagine Cup Standard — Personal Relationship Agent
// ═══════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Zap,
  Check,
  Copy,
  TrendingUp,
  Users,
  MessageSquareQuote,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { DEMO_CONTACTS } from '@/lib/demo-data';
import { netPulseStore } from '@/lib/storage/db';
import { isContactOverdue } from '@/lib/scoring';
import { DEFAULT_SETTINGS } from '@/lib/types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string }[];
  drafts?: { angle: string; text: string }[];
}

export function PulseBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: "👋 Hi Shashank! I'm PulseBot, your autonomous relationship copilot. I continuously monitor your network cadence, detect relationship decay, and draft contextual icebreakers.",
      timestamp: 'Just now',
      quickActions: [
        { label: '📊 Audit Network Health', action: 'audit' },
        { label: '🎯 High-Value VCs & Tech Leads', action: 'vcs' },
        { label: '✍️ Draft Reconnect to Elena Rostova', action: 'draft_elena' },
      ],
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAction = async (action: string) => {
    if (action === 'audit') {
      addUserMessage('Audit my overall network health.');
      setIsTyping(true);

      const contacts = await netPulseStore.getContacts();
      const offsetDays = await netPulseStore.getDecayOffsetDays();
      const overdue = contacts.filter(c => isContactOverdue(c, DEFAULT_SETTINGS, offsetDays));
      const priorityOverdue = overdue.filter(c => c.relationship_tier === 'priority');

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'bot',
          text: `📊 Live Network Health Audit:\n• Total Contacts: ${contacts.length} Industry Leaders\n• Overdue Contacts: ${overdue.length} (${Math.round((overdue.length / contacts.length) * 100)}% of network)\n• Priority Tier SLA Breaches: ${priorityOverdue.length}\n• Temporal Horizon: ${offsetDays > 0 ? `+${offsetDays} Days Simulated Decay` : 'Real-time Baseline'}\n\n🔥 Immediate Recommended Interventions:\n${overdue.slice(0, 3).map((c, i) => `${i + 1}. ${c.full_name} (${c.company || 'Enterprise'}) — Recency Urgent`).join('\n')}`,
          timestamp: 'Just now',
          quickActions: [
            { label: '✍️ Draft Reconnect for Top Priority', action: 'draft_top' },
            { label: '⏱️ Open Decay Simulator', action: 'open_sim' },
          ],
        },
      ]);
    } else if (action === 'draft_top' || action === 'draft_elena' || action === 'draft_marcus') {
      const targetName = action === 'draft_marcus' ? 'Marcus Vance' : 'Dr. Elena Rostova';
      addUserMessage(`Draft reconnect options for ${targetName}.`);
      setIsTyping(true);

      try {
        const res = await fetch('/api/ai/draft-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceText: action === 'draft_marcus' 
              ? 'Completed production benchmarks on NetPulse distributed write-ahead persistence.'
              : 'Recent work on autonomous agent state graphs and resilient failure recovery.',
            contactName: targetName,
            contactCompany: action === 'draft_marcus' ? 'Benchmark Capital' : 'Google DeepMind',
            contactRole: action === 'draft_marcus' ? 'General Partner' : 'Principal Research Scientist',
            tier: 'priority',
          }),
        });

        const data = await res.json();
        setIsTyping(false);

        if (data.success && data.drafts) {
          setMessages(prev => [
            ...prev,
            {
              id: String(Date.now()),
              sender: 'bot',
              text: `Synthesized 3 reconnection angles for ${targetName} (via ${data.source}):`,
              timestamp: 'Just now',
              drafts: data.drafts.map((d: { label: string; text: string }) => ({ angle: d.label, text: d.text })),
            },
          ]);
        }
      } catch {
        setIsTyping(false);
      }
    } else if (action === 'open_sim') {
      window.dispatchEvent(new CustomEvent('netpulse:open-simulator'));
    } else if (action === 'reset_sim') {
      await netPulseStore.setDecayOffsetDays(0);
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'bot',
          text: '🔄 Horizon reset to baseline today.',
          timestamp: 'Just now',
          quickActions: [
            { label: '📊 Audit Network Health', action: 'audit' },
          ],
        },
      ]);
    }
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'user',
        text,
        timestamp: 'Just now',
      },
    ]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const lower = userText.toLowerCase();
    setInput('');
    addUserMessage(userText);
    setIsTyping(true);

    // 1. Check for Simulation commands
    if (lower.includes('simulate') || lower.includes('fast forward') || lower.includes('30 days') || lower.includes('+30d')) {
      await netPulseStore.setDecayOffsetDays(30);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'bot',
          text: '⏱️ Time-travel activated: Simulated +30 days of relationship decay across your entire network! Urgency scores recalculated and Cadence Watchdog alerting.',
          timestamp: 'Just now',
          quickActions: [
            { label: '📊 Audit Network Health', action: 'audit' },
            { label: '🔄 Reset to Baseline', action: 'reset_sim' },
          ],
        },
      ]);
      return;
    }

    if (lower.includes('reset') && (lower.includes('decay') || lower.includes('baseline') || lower.includes('horizon'))) {
      await netPulseStore.setDecayOffsetDays(0);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'bot',
          text: '🔄 Decay simulation reset to today\'s baseline calendar horizon. All scores normalized.',
          timestamp: 'Just now',
          quickActions: [
            { label: '📊 Audit Network Health', action: 'audit' },
          ],
        },
      ]);
      return;
    }

    // 2. Check for Contact & Company Search
    const allContacts = await netPulseStore.getContacts();
    const matched = allContacts.filter(c =>
      (c.company && lower.includes(c.company.toLowerCase())) ||
      lower.includes(c.full_name.toLowerCase()) ||
      (c.title && lower.includes(c.title.toLowerCase())) ||
      (lower.includes('vc') && (c.title?.toLowerCase().includes('partner') || c.company?.toLowerCase().includes('capital') || c.company?.toLowerCase().includes('fund'))) ||
      (lower.includes('founder') && c.title?.toLowerCase().includes('founder'))
    );

    if (matched.length > 0 && (lower.includes('who') || lower.includes('contact') || lower.includes('find') || lower.includes('show') || lower.includes('vc') || lower.includes('founder') || lower.includes('lead') || lower.includes('work') || lower.includes('at'))) {
      setIsTyping(false);
      const topMatch = matched[0];
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'bot',
          text: `🔍 Found ${matched.length} key connection${matched.length > 1 ? 's' : ''} matching your inquiry:\n\n${matched.slice(0, 3).map((c, i) => `${i + 1}. ${c.full_name} — ${c.title || 'Leader'} at ${c.company || 'Enterprise'} (${c.relationship_tier.toUpperCase()} tier)`).join('\n')}\n\nWould you like me to draft a contextual outreach message or schedule a meeting?`,
          timestamp: 'Just now',
          quickActions: [
            { label: `✍️ Draft Reconnect for ${topMatch.full_name.split(' ')[0]}`, action: `draft_${topMatch.id}` },
            { label: '📊 Audit Network Health', action: 'audit' },
          ],
        },
      ]);
      return;
    }

    // 3. Fallback: Contextual AI Reconnect Synthesis
    try {
      const res = await fetch('/api/ai/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: userText,
          contactName: matched[0]?.full_name || 'Strategic Partner',
          contactCompany: matched[0]?.company || 'Technology Leadership',
          contactRole: matched[0]?.title || 'Executive',
          tier: matched[0]?.relationship_tier || 'priority',
        }),
      });

      const data = await res.json();
      setIsTyping(false);

      if (data.success && data.drafts) {
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'bot',
            text: `Analyzed your inquiry ("${data.summary}"). Here are 3 personalized reconnect drafts:`,
            timestamp: 'Just now',
            drafts: data.drafts.map((d: { label: string; text: string }) => ({ angle: d.label, text: d.text })),
            quickActions: [
              { label: '📊 Audit Network Health', action: 'audit' },
              { label: '⏱️ Open Decay Simulator', action: 'open_sim' },
            ],
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'bot',
            text: "I've analyzed your network. You can ask me to search specific connections (e.g., 'Who works at Stripe?'), audit network health, or draft personalized outreach.",
            timestamp: 'Just now',
            quickActions: [
              { label: '📊 Audit Network Health', action: 'audit' },
              { label: '🎯 High-Value VCs & Tech Leads', action: 'vcs' },
            ],
          },
        ]);
      }
    } catch {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'all 0.25s ease',
        }}
        aria-label="Open PulseBot AI Copilot"
        title="Open PulseBot AI Networking Copilot"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Copilot Drawer / Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 'min(440px, calc(100vw - 32px))',
            height: 'min(620px, calc(100vh - 120px))',
            backgroundColor: 'var(--np-bg-card)',
            border: '1px solid var(--np-border)',
            borderRadius: 16,
            boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 998,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--np-border)',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  PulseBot AI Copilot
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      fontWeight: 700,
                    }}
                  >
                    LIVE
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
                  Autonomous Network SLA &amp; Reconnect Engine
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--np-text-tertiary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    backgroundColor:
                      msg.sender === 'user' ? 'var(--np-accent)' : 'var(--np-bg-tertiary)',
                    color: msg.sender === 'user' ? 'white' : 'var(--np-text-primary)',
                    whiteSpace: 'pre-wrap',
                    border: msg.sender === 'bot' ? '1px solid var(--np-border)' : 'none',
                  }}
                >
                  {msg.text}
                </div>

                {/* Drafts Cards */}
                {msg.drafts && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                    {msg.drafts.map((draft, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: 'var(--np-bg-secondary)',
                          border: '1px solid var(--np-border)',
                          borderRadius: 10,
                          padding: '10px 12px',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--np-accent)',
                            marginBottom: 6,
                            fontSize: '0.75rem',
                          }}
                        >
                          {draft.angle}
                        </div>
                        <p style={{ color: 'var(--np-text-secondary)', marginBottom: 8 }}>
                          {draft.text}
                        </p>
                        <button
                          onClick={() => copyToClipboard(draft.text, `${msg.id}-${idx}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: 'var(--np-bg-tertiary)',
                            border: '1px solid var(--np-border)',
                            color: 'var(--np-text-primary)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {copiedId === `${msg.id}-${idx}` ? (
                            <>
                              <Check size={12} style={{ color: '#10b981' }} />
                              Copied to Clipboard!
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              Copy Draft
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Action Chips */}
                {msg.quickActions && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {msg.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(qa.action)}
                        style={{
                          background: 'rgba(79, 70, 229, 0.08)',
                          border: '1px solid rgba(79, 70, 229, 0.3)',
                          color: 'var(--np-accent)',
                          padding: '5px 10px',
                          borderRadius: 14,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 14px',
                  borderRadius: 12,
                  backgroundColor: 'var(--np-bg-tertiary)',
                  border: '1px solid var(--np-border)',
                  fontSize: '0.8rem',
                  color: 'var(--np-text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Sparkles size={14} className="animate-spin" />
                PulseBot is reasoning...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--np-border)',
              display: 'flex',
              gap: 8,
              backgroundColor: 'var(--np-bg-secondary)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask PulseBot or request message drafts..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--np-border)',
                backgroundColor: 'var(--np-bg-primary)',
                color: 'var(--np-text-primary)',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                backgroundColor: 'var(--np-accent)',
                color: 'white',
                border: 'none',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                opacity: input.trim() ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
