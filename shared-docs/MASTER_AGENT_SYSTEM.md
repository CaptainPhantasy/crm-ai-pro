# Master Agent System Design

## System Overview

This document defines the complete autonomous agent system for executing the 7-phase build plan to address 60+ missing features.

**⚠️ CRITICAL: This system operates FULLY AUTONOMOUSLY.**

- **No AI Assistant Participation**: The AI assistant does NOT execute build tasks
- **Agent Independence**: All agents operate independently and autonomously
- **User Interaction**: User can request status reports from AI assistant, but assistant does NOT orchestrate
- **See**: `shared-docs/AUTONOMOUS_EXECUTION.md` for execution model details

## Agent Types & Counts

### Orchestration Agents (9 total)
1. **Master Orchestrator** (1) - Top-level coordinator
2. **Phase Orchestrators** (7) - One per phase
3. **Wave Orchestrators** (15-20) - 2-3 per phase

### Execution Agents (35+ total)
4. **Feature Builders** (35+) - Build individual features
5. **Validation Agents** (15-20) - One per wave
6. **Documentation Agents** (15-20) - One per wave

### Resolution Agents (1 + spawned)
7. **Master Resolution Agent** (1) - Continuous error resolver
8. **Fix Agents** (spawned as needed) - Specialized by error type:
   - Syntax Fix Agent
   - API Fix Agent
   - Schema Fix Agent
   - Component Fix Agent
   - RLS Fix Agent
   - Test Fix Agent
   - Dependency Builder Agent
   - Rollback Agent
   - Alternative Approach Agent
   - Minimal Version Agent

### Monitoring Agents (1)
9. **Continuous Monitoring Agent** (1) - System health monitor

**Total Agent Types: 9 core types + 10 specialized fix types = 19 agent types**
**Total Agents Deployed: ~100+ agents over full execution**

---

## Agent Responsibilities Matrix

| Agent Type | Spawns | Monitors | Reports To | Key Decision |
|------------|--------|----------|-----------|-------------|
| Master Orchestrator | Phase Orchestrators | BUILD_PLAN_MASTER.md | None (top level) | Phase transitions |
| Phase Orchestrator | Wave Orchestrators | phase[N]-status.md | Master Orchestrator | Wave sequencing |
| Wave Orchestrator | Feature Builders, Validation, Documentation | wave[N].[M]-progress.md | Phase Orchestrator | Feature coordination |
| Feature Builder | None (leaf) | Own progress | Wave Orchestrator | Implementation approach |
| Validation Agent | None (may trigger fixes) | Code quality, tests | Wave Orchestrator | Pass/fail validation |
| Documentation Agent | None (leaf) | Completed features | Wave Orchestrator | Doc updates |
| Master Resolution | Fix Agents | Error logs, blockers | All orchestrators | Error resolution strategy |
| Fix Agents | None (may spawn additional fixes) | Fix progress | Master Resolution | Fix approach |
| Continuous Monitor | Recovery agents | System health | Master Orchestrator | Health issues |

---

## Agent Communication Flow

```
Master Orchestrator
    ↕ (status updates)
Phase Orchestrator
    ↕ (wave status)
Wave Orchestrator
    ↕ (feature progress)
Feature Builder → Validation Agent → Documentation Agent
    ↓ (errors)
Master Resolution Agent
    ↕ (fix coordination)
Fix Agents
    ↓ (fixes)
Original Agent (retry)
```

---

## Autonomous Decision Making

### Master Orchestrator Decisions
- **When to start phase**: Dependencies met + previous phase validated
- **Resource allocation**: Prioritize critical path
- **Blocker handling**: Spawn Master Resolution, continue other work

### Phase Orchestrator Decisions
- **Wave sequencing**: Based on dependencies
- **Parallel vs sequential**: Independent features → parallel
- **Phase completion**: All waves done + validation passes

### Wave Orchestrator Decisions
- **Feature parallelization**: Independent features → parallel
- **Validation timing**: When all features complete
- **Documentation timing**: After validation passes

### Master Resolution Decisions
- **Error classification**: Determine error type
- **Fix strategy**: Immediate fix, alternative, or minimal
- **Retry logic**: When to retry, when to try alternative

---

## Agent Prompting Strategy

### Context Injection
All agent prompts include:
1. **Role Definition**: What the agent is
2. **Current Status**: Read from shared docs
3. **Task Details**: Specific requirements
4. **Success Criteria**: Clear completion markers
5. **Reference Docs**: Links to shared documentation
6. **Error Handling**: What to do on failure
7. **Reporting**: How to report completion

### Prompt Templates
- See `shared-docs/AGENT_PROMPTS.md` for all templates
- Templates filled with phase/wave/feature-specific details
- Context from shared docs injected automatically

### Prompt Optimization
- **Focused**: Only include relevant context
- **Actionable**: Clear next steps
- **Reference-based**: Point to docs, don't duplicate
- **Error-aware**: Include error handling instructions

---

## Subagent Management Patterns

### Spawning Pattern
1. **Read Status**: Check current state
2. **Determine Next**: Based on dependencies
3. **Create Prompt**: Fill template with specifics
4. **Deploy Agent**: Spawn with full context
5. **Monitor Progress**: Watch progress files

### Monitoring Pattern
- **Frequency**: Based on agent type (1-5 min intervals)
- **What**: Progress files, error logs, status files
- **Action**: Spawn next agent or fix agent as needed

### Coordination Pattern
- **Shared State**: Progress files as communication medium
- **Hierarchical**: Orchestrators read subagent progress
- **Error Propagation**: Any agent → Master Resolution

### Lifecycle Pattern
- **Spawn**: Orchestrator creates with prompt
- **Execute**: Agent works on task
- **Report**: Agent updates progress
- **Complete**: Agent marks done
- **Terminate**: Orchestrator moves on

---

## Error Handling & Recovery

### Error Detection
- **Sources**: Agent error logs, validation failures, test failures
- **Detection**: Master Resolution Agent monitors continuously
- **Classification**: Automatic error type detection

### Recovery Strategies
1. **Immediate Fix**: Spawn fix agent (no delay)
2. **Parallel Work**: Continue other agents
3. **Retry Logic**: Original agent retries after fix
4. **Alternative**: Different approach if retry fails
5. **Minimal Version**: Basic implementation if all fails

### Never-Stop Guarantee
- System always has agents working
- Blockers spawn fix agents automatically
- Alternative approaches tried autonomously
- Minimal versions deployed if needed
- Enhancements queued for later

---

## Progress Tracking System

### Status Files
- `BUILD_PLAN_MASTER.md` - Overall status (all read/write)
- `phase[N]-status.md` - Phase progress (phase orchestrator writes)
- `wave[N].[M]-progress.md` - Wave progress (wave orchestrator writes)
- `errors/[error-id].md` - Error logs (any agent writes)
- `orchestrator-decisions.md` - Decision log (orchestrators write)

### Status Indicators
- ⏳ Waiting/Pending
- 🟡 In Progress
- ✅ Complete
- ❌ Failed (spawns fix agent)
- 🔄 Retrying

### Progress Queries
- **What's working?**: Read progress files, look for ✅
- **What's blocked?**: Read BUILD_PLAN_MASTER.md
- **What's failing?**: Read errors/ directory
- **What's next?**: Read orchestrator-decisions.md

---

## Agent Deployment Sequence

### Initial Deployment
```
1. Master Orchestrator starts
   ↓
2. Reads BUILD_PLAN_MASTER.md
   ↓
3. Determines Phase 1 ready (no dependencies)
   ↓
4. Spawns Phase 1 Orchestrator
   ↓
5. Phase 1 Orchestrator spawns Wave 1.1 Orchestrator
   ↓
6. Wave 1.1 Orchestrator spawns 3 Feature Builders (parallel)
   ↓
7. Feature Builders work in parallel
   ↓
8. When complete → Validation Agent
   ↓
9. When validated → Documentation Agent
   ↓
10. Wave complete → Next wave
```

### Continuous Deployment
- Agents spawn subagents as needed
- No human intervention required
- System always has agents working
- Blockers spawn fix agents automatically

---

## Quality Assurance

### Pre-Deployment
- Verify dependencies met
- Check prompt completeness
- Validate success criteria clear

### During Execution
- Monitor progress updates
- Check for errors
- Validate intermediate outputs

### Post-Completion
- Verify success criteria met
- Check for regressions
- Validate documentation updated

---

## Performance Optimization

### Parallelization
- Independent features → Parallel (max 4 per wave)
- Dependent features → Sequential
- Fix agents → Always parallel with other work

### Resource Management
- Limit simultaneous agents
- Prioritize critical path
- Queue non-critical work

### Token Efficiency
- Reference shared docs (don't duplicate)
- Focused prompts (only relevant context)
- Batch related operations

---

## Success Metrics

### Per Agent
- Task completion rate
- Error rate
- Time to completion
- Quality of output

### Per Wave
- All features complete
- Validation passes
- Documentation updated
- No regressions

### Per Phase
- All waves complete
- Phase validation passes
- Ready for next phase

### Overall
- System always progressing
- No human intervention needed
- All features built
- Production ready

---

## Autonomous Operation Guarantees

1. **Never Stop**: System always has agents working
2. **Auto-Fix**: Blockers spawn fix agents immediately
3. **Auto-Progress**: Phase transitions happen autonomously
4. **Auto-Retry**: Failed work retries after fixes
5. **Auto-Alternative**: Tries different approaches if needed
6. **Auto-Minimal**: Implements basic version if all fails
7. **Auto-Enhance**: Queues enhancements for later phases

---

## Reference Documents

- `AGENT_ARCHITECTURE.md` - Detailed agent type definitions
- `AGENT_PROMPTS.md` - Prompt templates for all agents
- `SUBAGENT_MANAGEMENT.md` - How agents manage subagents
- `BUILD_PLAN_MASTER.md` - Overall execution status
- `API_CONTRACTS.md` - API endpoint contracts
- `COMPONENT_PATTERNS.md` - UI component patterns
- `phase[N]-[name].md` - Phase-specific documentation

---

## Next Steps

1. **User Initiates** - Start build execution (via swarm command)
2. **Master Orchestrator Starts** - Autonomous agent begins execution
3. **System Operates** - Fully autonomous until complete
4. **User Checks In** - Request status reports from AI assistant as needed

**Note**: AI assistant does NOT participate in execution. Assistant is available for:
- Status check-ins (when requested)
- Plan adjustments (when requested)
- Questions and explanations (when requested)
- **NOT** for execution

