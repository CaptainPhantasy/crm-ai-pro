# Voice Agent Demo - Full Browser Experience

## Access the Demo

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Navigate to**: http://localhost:3000/voice-demo

## Features

### 🎤 Voice Input
- Click "Record" button to start voice recording
- Browser speech recognition transcribes your speech
- Click "Stop" when done
- Click "Send" to process the command

### ⌨️ Text Input
- Type commands directly in the text area
- Press Enter or click "Send" to process

### 👁️ Visual Feedback
- **User messages**: Blue bubbles on the right
- **Agent responses**: White bubbles on the left
- **Tool calls**: Shown in blue boxes with function name and arguments
- **Results**: Shown in green boxes with execution results
- **Errors**: Shown in red boxes

### 🔊 Audio Output
- Agent responses are automatically spoken using browser text-to-speech
- You'll hear the confirmation of actions

## Example Commands

1. **Create a job**:
   - "Create a job for John Smith to fix a leaky kitchen faucet tomorrow at 2pm"

2. **Search contacts**:
   - "Search for contacts named John"

3. **Update job status**:
   - "Update job status to completed" (will use the most recent job)

4. **Get job details**:
   - "Show me job details" (will use the most recent job)

## What You'll See

1. **Your command** appears as a blue bubble
2. **Tool call visualization** shows:
   - Function name (e.g., `create_job`)
   - Arguments (e.g., `{ "contactName": "John Smith", "description": "fix faucet" }`)
3. **Execution result** shows:
   - Job ID if created
   - Contact list if searched
   - Status update confirmation
4. **Spoken response** confirms what was done

## Technical Details

- Uses browser Web Speech API for voice input
- Uses browser SpeechSynthesis API for audio output
- Calls `/api/voice-command` which proxies to Supabase edge function
- Edge function uses OpenAI function calling to parse commands
- Tools execute and return results in real-time

## Troubleshooting

- **No voice recognition**: Browser may not support it. Use text input instead.
- **No audio output**: Check browser permissions for audio
- **401 errors**: Make sure you're logged in or account ID is set
- **Tool calls not showing**: Check browser console for errors

