# Voice Agent Architecture - Actual Implementation

## The Real Flow

1. **ElevenLabs Voice Agent** (External Service)
   - User speaks → ElevenLabs transcribes audio
   - Sends webhook to `/api/webhooks/elevenlabs` with transcription

2. **ElevenLabs Webhook** (`app/api/webhooks/elevenlabs/route.ts`)
   - Receives: `{ event: "conversation_item_input_audio_transcription_completed", transcription: "..." }`
   - Calls `voice-command` edge function with transcription
   - Returns response text for ElevenLabs to speak

3. **Voice Command Edge Function** (`supabase/functions/voice-command/index.ts`)
   - Uses **OpenAI's function calling API** (gpt-4o-mini)
   - Sends transcription to OpenAI with tool schemas
   - OpenAI returns tool calls (function name + arguments)
   - Executes the tools (create_job, update_job_status, etc.)
   - Generates natural language response via OpenAI
   - Returns response

4. **Tool Execution**
   - Tools are executed directly in the edge function
   - Calls other edge functions (create-job, update-job-status) or queries Supabase
   - Returns results

## Tool Calling Mechanism

**NOT a custom implementation** - Uses **OpenAI's native function calling**:

```typescript
// OpenAI API call with tools
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Parse this voice command: "${transcription}"` }
    ],
    tools: Object.values(AI_TOOLS), // Tool schemas
    tool_choice: 'auto',
  }),
})

// OpenAI returns tool_calls array
const toolCalls = aiData.choices[0]?.message?.tool_calls || []

// Execute each tool call
for (const toolCall of toolCalls) {
  const functionName = toolCall.function.name
  const functionArgs = JSON.parse(toolCall.function.arguments)
  // Execute tool...
}
```

## Available Tools

1. `create_job` - Creates job via `create-job` edge function
2. `update_job_status` - Updates status via `update-job-status` edge function
3. `assign_tech` - Assigns tech via `assign-tech` edge function
4. `search_contacts` - Direct Supabase query
5. `get_job` - Direct Supabase query
6. `send_message` - Direct Supabase insert

## Summary

- **Voice Agent**: ElevenLabs (external service)
- **Tool Calling**: OpenAI function calling API (gpt-4o-mini)
- **Command Processing**: voice-command edge function
- **Tool Execution**: Direct function calls and Supabase queries

