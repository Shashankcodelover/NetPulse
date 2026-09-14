import { NextResponse } from 'next/server';

interface RequestPayload {
  sourceText: string;
  contactName?: string;
  contactRole?: string;
  contactCompany?: string;
  tier?: string;
  tone?: string;
  decayDays?: number;
  customApiKey?: string;
}

export interface ChannelPayload {
  linkedin: { text: string; charCount: number; fitsConnectionNote: boolean };
  whatsapp: { text: string; encodedUrl: string };
  email: { subject: string; body: string; mailtoUrl: string };
  calendar: { title: string; description: string; durationMinutes: number };
}

export interface ExecutiveDraft {
  type: 'executive' | 'warm_reconnect' | 'strategic_advisory' | 'peer_catchup' | 'high_leverage_ask';
  label: string;
  badge: string;
  strategyReason: string;
  text: string;
  channels: ChannelPayload;
}

function buildChannelVariants(contactName: string, company: string, baseText: string, archetype: string): ChannelPayload {
  // LinkedIn DM: concise, professional
  const linkedinText = baseText.trim();
  const charCount = linkedinText.length;
  const fitsConnectionNote = charCount <= 300;

  // WhatsApp: conversational, mobile emoji styling
  const whatsappText = `Hi ${contactName}! 👋 ${baseText.replace(/Hi [^,]+,\s*/i, '')}`;
  const encodedUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  // Email: Subject line + Formal Structure
  let subject = '';
  switch (archetype) {
    case 'warm_reconnect':
      subject = `Reconnecting / Thinking of your work at ${company}`;
      break;
    case 'strategic_advisory':
      subject = `Strategic synergy / Architecture notes for ${company}`;
      break;
    case 'peer_catchup':
      subject = `Quick 15-min sync / catch-up over coffee?`;
      break;
    case 'high_leverage_ask':
      subject = `Brief proposal & mutual collaboration (${company})`;
      break;
    default:
      subject = `Quick note regarding ${company} milestone`;
  }
  const emailBody = `${baseText}\n\nBest regards,\n[Your Name]`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

  // Calendar Event: 15-min agenda
  const calendarTitle = `Catch-up: [Your Name] <> ${contactName}`;
  const calendarDesc = `Agenda:\n1. Celebrate recent milestone at ${company}\n2. Discuss industry trends & architectural insights\n3. Identify mutual collaboration opportunities`;

  return {
    linkedin: { text: linkedinText, charCount, fitsConnectionNote },
    whatsapp: { text: whatsappText, encodedUrl },
    email: { subject, body: emailBody, mailtoUrl },
    calendar: { title: calendarTitle, description: calendarDesc, durationMinutes: 15 },
  };
}

export async function POST(req: Request) {
  try {
    const body: RequestPayload = await req.json();
    const {
      sourceText,
      contactName = 'Leader',
      contactRole = 'Executive',
      contactCompany = 'Industry',
      tier = 'priority',
      decayDays = 45,
      customApiKey,
    } = body;

    if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim()) {
      return NextResponse.json({ error: 'Source context or recent update is required.' }, { status: 400 });
    }

    const cleanText = sourceText.trim();
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    // 1. Live Gemini 1.5 Flash Synthesis (when API key is present)
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const prompt = `You are PulseBot, an elite executive relationship intelligence copilot for NetPulse CRM.
Target Connection: ${contactName}, ${contactRole} at ${contactCompany} (Tier: ${tier.toUpperCase()}, Days since contact: ${decayDays}d).
Their Recent Context / Milestone: "${cleanText}"

Synthesize 5 tailored executive outreach responses for distinct relationship archetypes:
1. "executive" (Concise, high-velocity, <35 words, C-suite respectful)
2. "warm_reconnect" (Relational, acknowledges elapsed time, references mutual foundation)
3. "strategic_advisory" (Thought leadership, industry inflection, win-win collaboration)
4. "peer_catchup" (Low cognitive friction, 15-minute coffee or virtual catch-up)
5. "high_leverage_ask" (Direct value proposition with crystal-clear call-to-action)

Format your response STRICTLY as JSON with this schema:
{
  "summary": "1-sentence executive distillation of their update",
  "audioBriefing": "Spoken 3-sentence executive briefing suitable for text-to-speech audio playback before hopping on a call",
  "drafts": [
    { "type": "executive", "label": "Executive Concise", "badge": "<35 words", "strategyReason": "...", "text": "..." },
    { "type": "warm_reconnect", "label": "Warm Reconnect", "badge": "Cadence Anchor", "strategyReason": "...", "text": "..." },
    { "type": "strategic_advisory", "label": "Strategic Advisory", "badge": "High Leverage", "strategyReason": "...", "text": "..." },
    { "type": "peer_catchup", "label": "Peer Coffee Sync", "badge": "Frictionless", "strategyReason": "...", "text": "..." },
    { "type": "high_leverage_ask", "label": "Direct Partnership", "badge": "Action Oriented", "strategyReason": "...", "text": "..." }
  ]
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsed = JSON.parse(candidateText);
            const enrichedDrafts: ExecutiveDraft[] = parsed.drafts.map((d: any) => ({
              ...d,
              channels: buildChannelVariants(contactName, contactCompany, d.text, d.type),
            }));

            return NextResponse.json({
              success: true,
              source: 'gemini-1.5-flash',
              summary: parsed.summary,
              audioBriefing: parsed.audioBriefing || `Briefing on ${contactName}, ${contactRole} at ${contactCompany}. Current tier is ${tier}. Last contacted ${decayDays} days ago.`,
              drafts: enrichedDrafts,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini live call fallback triggered:', geminiError);
      }
    }

    // 2. High-Precision Domain Synthesis Engine (Zero-Failure Deterministic Fallback)
    const firstSentence = cleanText.split('.')[0] || cleanText;
    const summary = cleanText.length > 120
      ? `${cleanText.substring(0, 117)}...`
      : cleanText;

    const baseDrafts: Array<{
      type: ExecutiveDraft['type'];
      label: string;
      badge: string;
      strategyReason: string;
      text: string;
    }> = [
      {
        type: 'executive',
        label: 'Executive Concise',
        badge: '<35 words',
        strategyReason: 'Maximum brevity. Respects busy founder/executive schedules while opening a clear channel.',
        text: `Hi ${contactName}, saw your milestone regarding "${firstSentence.substring(0, 35)}...". Outstanding execution at ${contactCompany}. Would value 10 minutes next week to share relevant architectural findings. Let me know if Tuesday works.`,
      },
      {
        type: 'warm_reconnect',
        label: 'Warm Reconnect',
        badge: 'Cadence Anchor',
        strategyReason: 'Re-ignites relationship warmth by acknowledging the elapsed time and celebrating their momentum.',
        text: `Hi ${contactName}! It's been a little while since we last spoke, but I saw your recent update on "${firstSentence.substring(0, 40)}..." and wanted to congratulate you. The momentum at ${contactCompany} is truly impressive. Would love to catch up properly soon!`,
      },
      {
        type: 'strategic_advisory',
        label: 'Strategic Advisory',
        badge: 'High Leverage',
        strategyReason: 'Positions you as a thought partner with shared market insight and complementary capabilities.',
        text: `Impressive milestone, ${contactName}. Scaling "${firstSentence.substring(0, 35)}..." creates major strategic leverage for ${contactCompany}. We have been analyzing parallel dynamics in distributed infrastructure—would welcome exchanging notes when you have bandwidth.`,
      },
      {
        type: 'peer_catchup',
        label: 'Peer Coffee Sync',
        badge: 'Frictionless',
        strategyReason: 'Zero-pressure social catch-up designed for high acceptance and casual bi-directional sharing.',
        text: `Hey ${contactName}, huge congratulations on "${firstSentence.substring(0, 35)}..."! Hope you're taking a moment to celebrate. If you're up for a quick 15-minute coffee or virtual catch-up next week, drinks are on me! ☕`,
      },
      {
        type: 'high_leverage_ask',
        label: 'Direct Partnership',
        badge: 'Action Oriented',
        strategyReason: 'Clear and structured value proposition for high-stakes dealmaking or partnership exploratory calls.',
        text: `Hi ${contactName}, following your update on "${firstSentence.substring(0, 35)}...", I see an immediate mutual synergy between our teams. Would you be open to a 15-minute exploratory sync this Thursday at 3 PM to explore joint integration?`,
      },
    ];

    const drafts: ExecutiveDraft[] = baseDrafts.map(d => ({
      ...d,
      channels: buildChannelVariants(contactName, contactCompany, d.text, d.type),
    }));

    const audioBriefing = `Executive briefing for ${contactName}, ${contactRole} at ${contactCompany}. Relationship priority tier is ${tier.toUpperCase()}. It has been approximately ${decayDays} days since your last recorded touchpoint. Based on their recent update regarding ${firstSentence.substring(0, 50)}, recommended action is to initiate a warm reconnection focused on shared market synergies.`;

    return NextResponse.json({
      success: true,
      source: 'domain-synthesis-engine',
      summary,
      audioBriefing,
      drafts,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error during draft generation.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
