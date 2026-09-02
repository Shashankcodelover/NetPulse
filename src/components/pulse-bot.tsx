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

  const handleAction = (action: string) => {
    if (action === 'audit') {
      addUserMessage('Audit my overall network health.');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'bot',
            text: "📊 Network Health Diagnostic:\n• Portfolio Size: 25 High-Caliber Industry Contacts\n• Priority Tier (Tier 1): 5 Key Relationships (14-day cadence)\n• Warm Tier (Tier 2): 6 Tactical Allies (30-day cadence)\n• Cold / Mentors (Tier 3): 1 Contact\n• Current Decay Risk: ⚠️ 72% of Priority relationships are past SLA threshold.\n\n🔥 Top 3 Urgent Action Items:\n1. Dr. Elena Rostova (Google DeepMind) — 42 days cold (28 days past 14d SLA).\n2. Marcus Vance (Benchmark Capital) — 35 days cold (21 days past SLA).\n3. Aria Chen (Stripe) — 28 days cold (14 days past SLA).",
            timestamp: 'Just now',
            quickActions: [
              { label: '✍️ Draft Outreach to Marcus Vance', action: 'draft_marcus' },
              { label: '✍️ Draft Outreach to Elena Rostova', action: 'draft_elena' },
            ],
          },
        ]);
      }, 700);
    } else if (action === 'vcs') {
      addUserMessage('Show me top VCs and technical decision-makers who need follow-ups.');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'bot',
            text: "🎯 Top Decision-Makers in Your Active Pipeline:\n• Marcus Vance (General Partner @ Benchmark Capital)\n  Focus: Enterprise Infra & Offline Systems | Status: 35d cold (Score: 88)\n• Kavita Nair (Vice President @ Sequoia Capital Peak XV)\n  Focus: DeepTech & Agentic AI | Status: 32d cold (Score: 86)\n• Aria Chen (Engineering Director @ Stripe)\n  Focus: Distributed Payments Core | Status: 28d cold (Score: 88)",
            timestamp: 'Just now',
            quickActions: [
              { label: '✍️ Generate Pitch Update for Marcus', action: 'draft_marcus' },
            ],
          },
        ]);
      }, 700);
    } else if (action === 'draft_elena') {
      addUserMessage('Draft a contextual reconnect message for Dr. Elena Rostova.');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'bot',
            text: 'Here are 3 contextual outreach angles tailored to Dr. Elena Rostova (Principal Research Scientist @ Google DeepMind), referencing your previous discussion on LangGraph state orchestrators:',
            timestamp: 'Just now',
            drafts: [
              {
                angle: 'Angle A: Insight-Driven Technical Follow-up (Recommended)',
                text: 'Hi Dr. Elena, I was reflecting on our conversation at the Agentic AI Summit regarding StateGraph error boundaries. We recently implemented an offline-first event queue that idempotently reconciles transient failures during edge execution. Would love to share a 2-minute architectural demo if you have a moment next week!',
              },
              {
                angle: 'Angle B: Quick Low-Friction Catchup',
                text: 'Hi Elena! Hope you are doing well at DeepMind. Noticed your team’s recent publications on foundation model reasoning benchmarks — incredible work. Would love to grab a brief 15-minute virtual coffee sometime this month to catch up on what you are building.',
              },
              {
                angle: 'Angle C: Imagine Cup & Research Collaboration Ask',
                text: 'Hi Elena, I hope all is great with you. I am currently advancing our hyper-resilient distributed communications project for the Microsoft Imagine Cup. Given your expertise in resilient agent pipelines, I would be deeply grateful for 10 minutes of your feedback on our consensus topology.',
              },
            ],
          },
        ]);
      }, 900);
    } else if (action === 'draft_marcus') {
      addUserMessage('Draft a high-intent update for Marcus Vance at Benchmark.');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'bot',
            text: 'Here are 2 investor-ready outreach angles for Marcus Vance (General Partner @ Benchmark Capital):',
            timestamp: 'Just now',
            drafts: [
              {
                angle: 'Angle 1: Telemetry & Milestone Update (Highest Response Rate)',
                text: 'Hi Marcus, Following up on our chat regarding enterprise infrastructure telemetry: we just completed live production benchmarking on NetPulse, achieving zero-error 200 OK throughput and client-side deterministic scoring with sub-millisecond latency. Attached our architecture teardown — would love to share a quick 10-minute briefing if you have bandwidth this Thursday.',
              },
              {
                angle: 'Angle 2: Quick Direct Query',
                text: 'Hi Marcus, hope all is well at Benchmark. We are locking in our technical architecture deck ahead of the Imagine Cup and wanted to check if you had 10 minutes for a quick advisor perspective on our distributed sync engine.',
              },
            ],
          },
        ]);
      }, 900);
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    addUserMessage(userText);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = userText.toLowerCase();
      let responseText = "I've analyzed your request across your relationship graph. ";

      if (lower.includes('pitch') || lower.includes('investor') || lower.includes('vc')) {
        responseText += "For investors like Marcus Vance and Kavita Nair, prioritize concise metric milestones: latency reduction, active users, and architectural differentiation. Avoid asking for general advice; ask for feedback on a specific hypothesis.";
      } else if (lower.includes('elena') || lower.includes('deepmind') || lower.includes('ai')) {
        responseText += "Dr. Elena Rostova values rigorous technical citations and StateGraph robustness. I recommend sharing our idempotent queue benchmarks.";
      } else if (lower.includes('referral') || lower.includes('job') || lower.includes('interview')) {
        responseText += "When seeking referrals from connections like Aria Chen (Stripe) or Sarah Jenkins (Vercel), first demonstrate that you've reviewed the exact job requisition and explain the exact 3 architectural competencies you fulfill.";
      } else {
        responseText += "I've noted that. Would you like me to audit contacts overdue for reconnect or generate a customized message?";
      }

      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'bot',
          text: responseText,
          timestamp: 'Just now',
          quickActions: [
            { label: '📊 Audit Network Health', action: 'audit' },
            { label: '✍️ Draft Reconnect to Elena', action: 'draft_elena' },
          ],
        },
      ]);
    }, 800);
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
