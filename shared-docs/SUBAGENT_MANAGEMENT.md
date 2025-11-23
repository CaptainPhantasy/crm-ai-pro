# Subagent Management Patterns

## Overview
This document defines how agents manage their subagents, including spawning, monitoring, coordination, and lifecycle management.

---

## Agent Management Hierarchy

```
Master Orchestrator
  ├─ Manages: Phase Orchestrators (7)
  ├─ Monitors: BUILD_PLAN_MASTER.md
  └─ Coordinates: Master Resolution Agent

Phase Orchestrator
  ├─ Manages: Wave Orchestrators (2-3 per phase)
  ├─ Monitors: phase[N]-status.md
  └─ Reports: To Master Orchestrator

Wave Orchestrator
  ├─ Manages: Feature Builders (2-4 per wave)
  ├─ Manages: Validation Agent (1 per wave)
  ├─ Manages: Documentation Agent (1 per wave)
  ├─ Monitors: wave[N].[M]-progress.md
  └─ Reports: To Phase Orchestrator

Master Resolution Agent
  ├─ Manages: Fix Agents (spawned as needed)
  ├─ Monitors: Error logs, BUILD_PLAN_MASTER.md
  └─ Coordinates: With all orchestrators
```

---

## 1. Master Orchestrator Subagent Management

### Spawning Strategy
- **When**: Phase dependencies met, previous phase validated
- **How**: Read BUILD_PLAN_MASTER.md, determine next phase, spawn Phase Orchestrator
- **Prompt**: Use Phase Orchestrator template with phase-specific details

### Monitoring Strategy
- **Frequency**: Every 5 minutes
- **What**: Phase completion status, blockers, dependencies
- **Where**: BUILD_PLAN_MASTER.md, phase status files

### Coordination Strategy
- **With Master Resolution**: Share blocker information
- **With Phase Orchestrators**: Receive completion reports
- **Decision Making**: Phase transitions, resource allocation

### Lifecycle Management
```
Phase Orchestrator Spawned
  ↓
Monitor phase[N]-status.md
  ↓
Phase Complete?
  ├─ No → Continue monitoring
  └─ Yes → Validate phase
      ↓
      Validation Pass?
      ├─ No → Spawn fix agents, re-validate
      └─ Yes → Check dependencies
          ↓
          Dependencies Met?
          ├─ No → Wait (but continue other work)
          └─ Yes → Spawn next Phase Orchestrator
```

### Example: Spawning Phase 1 Orchestrator
```
1. Read BUILD_PLAN_MASTER.md
2. Check: Phase 1 status = "⏳ Waiting"
3. Check: Dependencies = None (can start)
4. Update: Phase 1 status = "🟡 In Progress"
5. Spawn: Phase 1 Orchestrator with prompt:
   - Phase overview
   - Wave breakdown
   - Completion criteria
   - Reference docs
6. Monitor: phase1-status.md for progress
```

---

## 2. Phase Orchestrator Subagent Management

### Spawning Strategy
- **When**: Previous wave complete, or phase start (Wave 1)
- **How**: Read phase status, determine next wave, spawn Wave Orchestrator
- **Prompt**: Use Wave Orchestrator template with wave-specific details

### Monitoring Strategy
- **Frequency**: Every 2 minutes
- **What**: Wave completion status, feature progress
- **Where**: phase[N]-status.md, wave progress files

### Coordination Strategy
- **With Wave Orchestrators**: Receive completion reports
- **With Validation**: Coordinate phase validation
- **With Master Orchestrator**: Report phase progress

### Lifecycle Management
```
Wave Orchestrator Spawned
  ↓
Monitor wave[N].[M]-progress.md
  ↓
All Features Complete?
  ├─ No → Continue monitoring
  └─ Yes → Spawn Validation Agent
      ↓
      Validation Pass?
      ├─ No → Spawn fix agents, re-validate
      └─ Yes → Spawn Documentation Agent
          ↓
          Documentation Complete?
          └─ Yes → Mark wave complete
              ↓
              More Waves?
              ├─ Yes → Spawn next Wave Orchestrator
              └─ No → Run Phase Validation
                  ↓
                  Phase Complete → Report to Master Orchestrator
```

### Example: Spawning Wave 1.1 Orchestrator
```
1. Read phase1-status.md
2. Check: Wave 1.1 status = "⏳ Pending"
3. Check: Dependencies = None (can start)
4. Update: Wave 1.1 status = "🟡 In Progress"
5. Spawn: Wave 1.1 Orchestrator with prompt:
   - Wave overview (Contact Management UI)
   - 3 parallel feature builders
   - Success criteria
   - Reference docs
6. Monitor: wave1.1-progress.md
```

---

## 3. Wave Orchestrator Subagent Management

### Spawning Strategy
- **Feature Builders**: Spawn all in parallel at wave start
- **Validation Agent**: Spawn when all features complete
- **Documentation Agent**: Spawn when validation passes

### Monitoring Strategy
- **Frequency**: Every 1 minute
- **What**: Feature completion status, validation results
- **Where**: wave[N].[M]-progress.md

### Coordination Strategy
- **With Feature Builders**: Monitor progress, handle completion
- **With Validation**: Coordinate validation timing
- **With Documentation**: Ensure docs updated before wave complete

### Lifecycle Management
```
Wave Start
  ↓
Spawn All Feature Builders in Parallel
  ↓
Monitor Progress Files
  ↓
All Features Complete?
  ├─ No → Continue monitoring
  └─ Yes → Spawn Validation Agent
      ↓
      Validation Running
      ↓
      Validation Complete
      ├─ Fail → Spawn fix agents, re-validate
      └─ Pass → Spawn Documentation Agent
          ↓
          Documentation Complete
          └─ Mark Wave Complete
              ↓
              Report to Phase Orchestrator
```

### Example: Managing Wave 1.1 Feature Builders
```
Initial Spawn (Parallel):
1. Agent 1.1.1: Contact Detail Modal
2. Agent 1.1.2: Add Contact Form
3. Agent 1.1.3: Message Contact

Monitoring:
- Check wave1.1-progress.md every minute
- Each agent updates progress when done
- Track: ⏳ Pending → 🟡 In Progress → ✅ Complete

When All Complete:
- Spawn Validation Agent
- Validation checks all 3 features
- If pass → Spawn Documentation Agent
- If fail → Spawn fix agents, re-validate
```

---

## 4. Master Resolution Agent Subagent Management

### Spawning Strategy
- **Trigger**: Error detected, blocker found, validation failure
- **How**: Classify error type, spawn appropriate fix agent immediately
- **Prompt**: Use specialized fix agent template with error details

### Monitoring Strategy
- **Frequency**: Continuous (every 2 minutes, or on error detection)
- **What**: Error logs, fix progress, resolution status
- **Where**: shared-docs/errors/, BUILD_PLAN_MASTER.md

### Coordination Strategy
- **With All Agents**: Receive error reports from any agent
- **With Orchestrators**: Share resolution status
- **With Fix Agents**: Monitor fix progress, coordinate retries

### Lifecycle Management
```
Error Detected
  ↓
Classify Error Type
  ↓
Spawn Appropriate Fix Agent (Immediate)
  ↓
Continue Other Work (Never Stop)
  ↓
Monitor Fix Progress
  ↓
Fix Complete?
  ├─ No → Continue monitoring, spawn additional fix if needed
  └─ Yes → Retry Original Work
      ↓
      Retry Success?
      ├─ Yes → Mark resolved, continue
      └─ No → Try Alternative Approach
          ↓
          Alternative Success?
          ├─ Yes → Mark resolved, continue
          └─ No → Implement Minimal Version
              ↓
              Mark for Enhancement Later
              ↓
              Continue to Next Task
```

### Example: Managing Fix Agents
```
Error: TypeScript error in contact-detail-modal.tsx
  ↓
Master Resolution Agent:
  1. Reads error log
  2. Classifies: TypeScript/Compilation Error
  3. Spawns: Syntax Fix Agent immediately
  4. Continues: Monitoring other errors
  5. Monitors: Fix agent progress

Syntax Fix Agent:
  1. Reads error details
  2. Fixes TypeScript errors
  3. Reports: Fix complete
  4. Original agent retries

Master Resolution Agent:
  1. Sees fix complete
  2. Triggers retry of original work
  3. Monitors retry
  4. If success → Mark resolved
  5. If fail → Spawn alternative approach agent
```

---

## 5. Subagent Communication Patterns

### Progress Updates
**Pattern**: Agents write to progress files, orchestrators read
```
Feature Builder → wave[N].[M]-progress.md
Wave Orchestrator → Reads progress file
Phase Orchestrator → Reads wave status
Master Orchestrator → Reads phase status
```

### Error Reporting
**Pattern**: Any agent can write error, Master Resolution reads
```
Any Agent → shared-docs/errors/[error-id].md
Master Resolution → Reads error, spawns fix agent
Fix Agent → Updates error log with resolution
```

### Decision Logging
**Pattern**: Orchestrators log decisions for audit
```
Orchestrator → shared-docs/orchestrator-decisions.md
Format: [Timestamp] [Agent] [Decision] [Reason]
```

### Status Synchronization
**Pattern**: Hierarchical status updates
```
Feature Builder → Updates wave progress
Wave Orchestrator → Updates phase status
Phase Orchestrator → Updates BUILD_PLAN_MASTER
Master Orchestrator → Reads master status
```

---

## 6. Subagent Conflict Resolution

### File Write Conflicts
**Problem**: Multiple agents writing to same file
**Solution**: 
- Orchestrator coordinates writes
- Agents write to separate sections
- Last write wins (orchestrator merges)

### Dependency Conflicts
**Problem**: Agent A needs X, Agent B needs Y, X conflicts with Y
**Solution**:
- Master Orchestrator analyzes conflict
- Determines if can be parallel (different files)
- Sequences if must be sequential
- Spawns dependency builder if needed

### Resource Conflicts
**Problem**: Too many agents running simultaneously
**Solution**:
- Queue management by orchestrator
- Prioritize critical path
- Run non-critical in background
- Limit parallel agents per wave

### Approach Conflicts
**Problem**: Multiple fix agents try different approaches
**Solution**:
- Master Resolution coordinates
- Try approaches sequentially
- Use first successful approach
- Document alternatives tried

---

## 7. Subagent Failure Handling

### Agent Stalls (>30 min no update)
**Detection**: Continuous Monitoring Agent
**Action**: 
1. Check for blockers
2. Spawn recovery agent
3. Restart original agent if needed
4. Continue other work

### Agent Fails Repeatedly
**Detection**: Master Resolution Agent
**Action**:
1. Try alternative approach agent
2. If still fails → Implement minimal version
3. Mark for enhancement later
4. Continue to next task

### Agent Creates Breaking Change
**Detection**: Validation Agent
**Action**:
1. Spawn rollback agent immediately
2. Rollback breaking change
3. Spawn fix agent with corrected approach
4. Re-validate after fix

### Agent Corrupts Shared State
**Detection**: Orchestrator monitoring
**Action**:
1. Restore from last known good state
2. Spawn recovery agent
3. Re-run affected agents
4. Continue with corrected state

---

## 8. Subagent Performance Optimization

### Parallel Execution
- **Rule**: Independent features → Parallel
- **Limit**: Max 4 parallel agents per wave
- **Coordination**: Wave Orchestrator manages

### Sequential Execution
- **Rule**: Dependent features → Sequential
- **Coordination**: Orchestrator sequences
- **Optimization**: Start next as soon as dependency ready

### Resource Management
- **Monitoring**: Track agent count
- **Throttling**: Limit simultaneous agents
- **Prioritization**: Critical path first

### Token Efficiency
- **Shared Docs**: Reference, don't duplicate
- **Focused Prompts**: Only include relevant context
- **Batch Operations**: Group related changes

---

## 9. Subagent Quality Assurance

### Pre-Deployment Checks
- Verify dependencies met
- Check agent prompt completeness
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

## 10. Example: Complete Subagent Flow

### Scenario: Phase 1 Wave 1.1 Execution

```
1. Master Orchestrator
   - Reads BUILD_PLAN_MASTER.md
   - Sees Phase 1 ready to start
   - Spawns Phase 1 Orchestrator

2. Phase 1 Orchestrator
   - Reads phase1-status.md
   - Determines Wave 1.1 ready
   - Spawns Wave 1.1 Orchestrator

3. Wave 1.1 Orchestrator
   - Spawns 3 Feature Builders in parallel:
     * Agent 1.1.1: Contact Detail
     * Agent 1.1.2: Add Contact Form
     * Agent 1.1.3: Message Contact
   - Monitors wave1.1-progress.md

4. Feature Builders (Parallel)
   - Each reads requirements
   - Each implements feature
   - Each updates progress file
   - Each reports completion

5. Wave 1.1 Orchestrator
   - Sees all 3 complete
   - Spawns Validation Agent

6. Validation Agent
   - Tests all 3 features
   - Checks for errors
   - Reports validation results

7. Wave 1.1 Orchestrator
   - If validation passes:
     * Spawns Documentation Agent
     * Documentation Agent updates docs
     * Marks wave complete
   - If validation fails:
     * Spawns Master Resolution Agent
     * Fix agents resolve issues
     * Re-validates

8. Phase 1 Orchestrator
   - Sees Wave 1.1 complete
   - Spawns Wave 1.2 Orchestrator
   - Continues until all waves done

9. Master Orchestrator
   - Sees Phase 1 complete
   - Validates dependencies for Phase 2
   - Spawns Phase 2 Orchestrator
```

---

## 11. Subagent Monitoring Dashboard

### Status Files Structure
```
shared-docs/
├── BUILD_PLAN_MASTER.md (Master status)
├── phase1-status.md (Phase 1 progress)
├── phase2-status.md (Phase 2 progress)
├── ...
├── wave1.1-progress.md (Wave 1.1 progress)
├── wave1.2-progress.md (Wave 1.2 progress)
├── ...
├── errors/
│   ├── phase1-wave1.1-agent1.1.1.md
│   └── ...
└── orchestrator-decisions.md (Decision log)
```

### Monitoring Queries
- **What's working?**: Read progress files, look for ✅
- **What's blocked?**: Read BUILD_PLAN_MASTER.md, check blockers
- **What's failing?**: Read errors/ directory
- **What's next?**: Read orchestrator-decisions.md

---

## 12. Subagent Spawning Best Practices

### Prompt Quality
- Include full context from shared docs
- Specify exact files to create/modify
- Provide success criteria
- Reference similar implementations

### Timing
- Spawn when dependencies ready
- Don't spawn too early (waste tokens)
- Don't spawn too late (delay progress)
- Parallel when possible

### Monitoring
- Check progress regularly
- Don't over-monitor (waste tokens)
- Don't under-monitor (miss issues)
- Balance frequency with efficiency

### Error Handling
- Include error handling in prompts
- Specify what to do on failure
- Provide fallback strategies
- Never stop on single failure

