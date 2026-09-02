import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sourceText } = await req.json();

    if (!sourceText || typeof sourceText !== 'string' || !sourceText.trim()) {
      return NextResponse.json({ error: 'Source post text is required.' }, { status: 400 });
    }

    const cleanText = sourceText.trim();
    const firstSentence = cleanText.split('.')[0] || cleanText;

    // Smart fallback summary and draft generator engine
    const summary = cleanText.length > 120
      ? `${cleanText.substring(0, 117)}...`
      : cleanText;

    const drafts = [
      {
        type: 'congratulate',
        label: 'Congratulate',
        text: `Huge congratulations on this step! Really inspiring to see your progress on "${firstSentence.substring(0, 40)}...". Rooting for your continued success! 🚀`,
      },
      {
        type: 'question',
        label: 'Ask a question',
        text: `Great insights! What was the single biggest challenge or surprise your team encountered when working through "${firstSentence.substring(0, 35)}..."?`,
      },
      {
        type: 'insight',
        label: 'Share an insight',
        text: `Strongly agree with this perspective. In my experience, focusing on early execution and tight feedback loops makes a massive difference here. Thanks for sharing! 🙌`,
      },
    ];

    return NextResponse.json({
      success: true,
      summary,
      drafts,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error during draft generation.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
