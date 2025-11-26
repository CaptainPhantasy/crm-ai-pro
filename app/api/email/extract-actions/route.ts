import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSession } from '@/lib/auth-helper'

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, emailBody } = body

    if (!emailBody) {
      return NextResponse.json(
        { error: 'Email body is required' },
        { status: 400 }
      )
    }

    // Call LLM Router to extract action items
    const llmResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        useCase: 'complex',
        prompt: `Extract action items, meetings, promises, and deadlines from this email:\n\n${emailBody}\n\nReturn a JSON object with arrays: actionItems, meetings, promises, deadlines. Each item should have: type, text, date (if mentioned), time (if mentioned), contact (if mentioned).`,
        systemPrompt: 'You are an AI assistant that extracts structured information from emails. Return only valid JSON.',
        maxTokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!llmResponse.ok) {
      throw new Error('LLM Router request failed')
    }

    const llmData = await llmResponse.json()
    
    // Parse the LLM response
    let actionItems = []
    try {
      const parsed = JSON.parse(llmData.text || '{}')
      actionItems = [
        ...(parsed.actionItems || []).map((item: any) => ({ ...item, type: 'action' })),
        ...(parsed.meetings || []).map((item: any) => ({ ...item, type: 'meeting' })),
        ...(parsed.promises || []).map((item: any) => ({ ...item, type: 'promise' })),
        ...(parsed.deadlines || []).map((item: any) => ({ ...item, type: 'deadline' })),
      ]
    } catch (error) {
      console.error('Failed to parse LLM response:', error)
    }

    // TODO: Store action items in database (email_action_items table)
    // For now, just return them

    return NextResponse.json({
      success: true,
      actionItems,
    })
  } catch (error) {
    console.error('Error extracting action items:', error)
    return NextResponse.json(
      { error: 'Failed to extract action items' },
      { status: 500 }
    )
  }
}

