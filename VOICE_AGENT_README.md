# Voice Agent Prompt Management

## Master Prompt File

**File:** `ELEVENLABS_VOICE_AGENT_PROMPT.md`

This is the single source of truth for the ElevenLabs voice agent system prompt. All updates should be made to this file first, then deployed to the ElevenLabs dashboard.

## How to Update the Voice Agent

1. **Edit the Master File**
   - Make changes to `ELEVENLABS_VOICE_AGENT_PROMPT.md`
   - Document changes in the CHANGELOG section at the bottom
   - Test the changes locally if possible

2. **Deploy to ElevenLabs**
   - Go to: https://elevenlabs.io/app/agents/agent_6501katrbe2re0c834kfes3hvk2d
   - Navigate to the "System Prompt" section
   - Copy the entire prompt from `ELEVENLABS_VOICE_AGENT_PROMPT.md` (everything after the instructions section)
   - Paste into the ElevenLabs system prompt field
   - Save changes

3. **Test Thoroughly**
   - Test with voice interactions
   - Verify all improvements are working
   - Check for any regressions
   - Monitor error logs

4. **Version Control**
   - Commit the updated `ELEVENLABS_VOICE_AGENT_PROMPT.md` to git
   - Include detailed commit message explaining changes
   - Tag important versions (e.g., `v1.0-phase1-improvements`)

## Current Version

**Version:** Phase 1 Improvements (2025-01-27)

**Changes Applied:**
- Eliminated filler phrase overuse
- Enforced extreme brevity (25 word max)
- Fixed success confirmation accuracy
- Improved email error recovery
- Removed contradictory natural speech guidance

## Testing Checklist

After deploying any prompt changes, test these scenarios:

### Filler Phrases
- [ ] Create job workflow - should have 0-2 filler phrases total
- [ ] Search contacts workflow - minimal fillers
- [ ] Send email workflow - no excessive "umm" or "hold on"

### Brevity
- [ ] All responses ≤25 words
- [ ] Most responses 10-15 words
- [ ] No response exceeds 2 sentences

### Success Confirmation
- [ ] Force contact search failure - agent should clearly state failure
- [ ] Force job creation failure - no false "everything is working" messages

### Email Errors
- [ ] Send email to invalid address - agent should verify address
- [ ] Agent should offer alternatives if email fails repeatedly

## Backup & Rollback

**Backup Location:** This git repository is the backup

**To Rollback:**
1. Find the previous version in git history: `git log ELEVENLABS_VOICE_AGENT_PROMPT.md`
2. Checkout the previous version: `git checkout <commit-hash> ELEVENLABS_VOICE_AGENT_PROMPT.md`
3. Copy the old prompt and deploy to ElevenLabs
4. Test to verify rollback worked

## Related Files

- `PHASE_1_COMPLETION_SUMMARY.md` - Phase 1 implementation details
- `PHASE_2_COMPLETION_SUMMARY.md` - Phase 2 implementation details
- `CRM_AI_Testing.md` - Testing transcripts and bug reports
- `archive/PHASE_1_ELEVENLABS_PROMPT_UPDATES.md.archived` - Original update guide (superseded)

## Contact

For questions about the voice agent prompt:
- Review git history for context on changes
- Check Phase 1/2 completion summaries for implementation details
- Test changes thoroughly before deploying to production
