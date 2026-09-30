import { NextResponse } from 'next/server';
import { processAiAssistantQuery } from '@/lib/ai-assistant';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message || '';

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const response = await processAiAssistantQuery(message);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('AI Assistant API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI query' },
      { status: 500 }
    );
  }
}
