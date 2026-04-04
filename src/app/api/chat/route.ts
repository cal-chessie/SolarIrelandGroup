import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { message: 'Please send a message.' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const systemPrompt = `You are a helpful assistant for Solar Ireland, an SEAI-registered solar panel installation company operating across Ireland (Connacht, Leinster, Munster).

Your role is to answer questions about solar panels, the SEAI grant scheme, installation process, costs, and general solar energy queries specific to Ireland.

Key facts to be accurate about:
- SEAI Solar PV grant in 2026: €1,800 (subject to eligibility)
- Typical system sizes for Irish homes: 2-5 kWp
- Average generation in Ireland: ~850-950 kWh per kWp per year
- Installation typically takes one day
- No planning permission needed in most cases
- Contact: cal@solarireland.com
- Phone: +353 87 395 8424

Be helpful, accurate, and honest. Do not make exaggerated claims or promise specific savings figures. Advise users that a free site survey is the best way to get accurate numbers for their home.
Keep responses concise (2-4 sentences unless the user asks for detailed information).`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const completion = await zai.chat.completions.create({
      messages: chatMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const messageContent =
      completion.choices?.[0]?.message?.content ||
      'Sorry, I could not generate a response. Please try again or email us at cal@solarireland.com.';

    return NextResponse.json({ message: messageContent });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        message:
          'I am having trouble connecting right now. Please try again or reach us on WhatsApp.',
      },
      { status: 500 }
    );
  }
}
