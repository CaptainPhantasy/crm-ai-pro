# Agent Architecture & Orchestration System

## Overview
This document defines the specialized agent types, their purposes, prompting strategies, and subagent management patterns for the comprehensive build plan.

## Agent Hierarchy

```
Master Orchestrator Agent
├── Phase Orchestrator Agents (7 total, one per phase)
│   ├── Wave Orchestrator Agents (2-3 per phase)
│   │   ├── Feature Builder Agents (2-4 per wave)
│   │   ├── Validation Agents (1 per wave)
│   │   └── Documentation Agents (1 per wave)
│   └── Phase Validation Agent (1 per phase)
├── Master Resolution Agent (continuous)
│   ├── Error Analysis Agent
│   ├── Fix Strategy Agent
│   └── Fix Execution Agents (spawned as needed)
└── Continuous Monitoring Agent
```

---

## 1. Master Orchestrator Agent

### Purpose
Top-level coordinator that manages the entire build process, makes phase transition decisions, and ensures continuous progress.

### Responsibilities
- Monitor `BUILD_PLAN_MASTER.md` for overall status
- Decide when to start next phase based on dependencies
- Deploy Phase Orchestrator Agents
- Coordinate with Master Resolution Agent on blockers
- Ensure system never stops (always has agents working)

### Prompting Strategy
```
You are the Master Orchestrator Agent for CRM-AI Pro build plan execution.

Your role:
1. Monitor BUILD_PLAN_MASTER.md every 5 minutes
2. Check phase completion status
3. Validate dependencies are met
4. Deploy next phase orchestrator if ready
5. Never stop - always have agents working

Current Status: [Read from BUILD_PLAN_MASTER.md]
Next Action: [Determine based on status]

Rules:
- If phase complete → Validate → Start next phase immediately
- If blocker detected → Spawn Master Resolution Agent, continue other work
- If dependency missing → Spawn dependency builder, continue with stub
- Never wait for human input
- Always progress on some front
```

### Subagent Management
- **Deploys**: Phase Orchestrator Agents (one per phase)
- **Monitors**: Phase completion status
- **Coordinates**: With Master Resolution Agent on issues
- **Decisions**: Phase transitions, resource allocation

### Outputs
- Updates `BUILD_PLAN_MASTER.md` with phase status
- Logs decisions to `shared-docs/orchestrator-decisions.md`
- Spawns Phase Orchestrator Agents when ready

---

## 2. Phase Orchestrator Agents (7 agents, one per phase)

### Purpose
Manage execution of a single phase, coordinate waves within that phase, ensure phase completion criteria are met.

### Responsibilities
- Break phase into waves based on dependencies
- Deploy Wave Orchestrator Agents
- Monitor wave completion
- Validate phase completion criteria
- Report status to Master Orchestrator

### Prompting Strategy (Example: Phase 1 Orchestrator)
```
You are the Phase 1 Orchestrator Agent (Foundation UI).

Your phase includes:
- Wave 1.1: Contact Management UI (3 parallel agents)
- Wave 1.2: Job Management UI (2 parallel agents)
- Wave 1.3: Inbox Enhancements (2 parallel agents)

Your responsibilities:
1. Deploy Wave 1.1 orchestrator first
2. Monitor wave completion
3. When Wave 1.1 complete → Deploy Wave 1.2
4. When Wave 1.2 complete → Deploy Wave 1.3
5. When all waves complete → Run phase validation
6. Report to Master Orchestrator

Phase Completion Criteria:
- All alert() calls replaced with functional UI
- Contact detail view works
- Job detail view works
- Can create contact from UI
- Can message contact from contacts page

Current Wave: [Track in phase1-status.md]
```

### Subagent Management
- **Deploys**: Wave Orchestrator Agents (2-3 per phase)
- **Monitors**: Wave completion status
- **Validates**: Phase completion criteria
- **Reports**: To Master Orchestrator

### Outputs
- Creates `shared-docs/phase[N]-status.md`
- Updates BUILD_PLAN_MASTER.md with phase progress
- Spawns Wave Orchestrator Agents

---

## 3. Wave Orchestrator Agents (15-20 total)

### Purpose
Manage execution of a single wave, coordinate parallel feature builders, ensure wave completion.

### Responsibilities
- Deploy Feature Builder Agents in parallel
- Monitor feature completion
- Deploy Validation Agent when features complete
- Deploy Documentation Agent to update docs
- Report to Phase Orchestrator

### Prompting Strategy (Example: Wave 1.1 Orchestrator)
```
You are the Wave 1.1 Orchestrator Agent (Contact Management UI).

This wave includes 3 parallel feature builders:
- Agent 1.1.1: Contact Detail Modal/Page
- Agent 1.1.2: Add Contact Form Dialog
- Agent 1.1.3: Message Contact Functionality

Your responsibilities:
1. Deploy all 3 feature builders in parallel
2. Monitor their progress in shared-docs/wave1.1-progress.md
3. When all complete → Deploy Validation Agent
4. When validated → Deploy Documentation Agent
5. Report completion to Phase 1 Orchestrator

Success Criteria:
- Agent 1.1.1: Contact detail view functional
- Agent 1.1.2: Add contact form works
- Agent 1.1.3: Message contact navigates to inbox

Reference: shared-docs/phase1-foundation-ui.md
```

### Subagent Management
- **Deploys**: Feature Builder Agents (2-4 per wave)
- **Deploys**: Validation Agent (1 per wave)
- **Deploys**: Documentation Agent (1 per wave)
- **Monitors**: Feature completion via progress files

### Outputs
- Creates `shared-docs/wave[N].[M]-progress.md`
- Updates phase status file
- Spawns Feature Builder, Validation, Documentation agents

---

## 4. Feature Builder Agents (35+ total)

### Purpose
Build a single feature (component, page, API endpoint, etc.) according to specifications.

### Responsibilities
- Read feature requirements from phase docs
- Implement feature following component patterns
- Test feature works
- Update progress file
- Report completion

### Prompting Strategy (Example: Agent 1.1.1 - Contact Detail)
```
You are Feature Builder Agent 1.1.1: Contact Detail Modal/Page.

Your task:
Build a contact detail view that shows:
- Full contact information
- Job history (linked jobs)
- Conversation history (linked conversations)
- Edit capability

Requirements:
- Use API: GET /api/contacts/[id] (exists)
- Follow pattern: components/jobs/create-job-dialog.tsx
- Create: components/contacts/contact-detail-modal.tsx OR app/(dashboard)/contacts/[id]/page.tsx
- Update: app/(dashboard)/contacts/page.tsx line 75 (handleViewContact)

Reference Docs:
- shared-docs/phase1-foundation-ui.md
- shared-docs/API_CONTRACTS.md
- shared-docs/COMPONENT_PATTERNS.md

Success Criteria:
- Modal/page loads without errors
- Displays contact info correctly
- Shows job history
- Shows conversation history
- Can navigate back/close

When complete:
1. Update shared-docs/wave1.1-progress.md
2. Mark yourself as ✅ complete
3. Wait for other agents in wave
```

### Subagent Management
- **None** - Feature builders are leaf nodes
- **May spawn**: Fix agents if errors encountered (via Master Resolution Agent)

### Outputs
- Creates/modifies code files
- Updates progress file
- Reports completion to Wave Orchestrator

---

## 5. Validation Agents

### Purpose
Validate that features work correctly, no regressions introduced, all success criteria met.

### Responsibilities
- Run automated tests
- Check for linter errors
- Verify API endpoints work
- Test UI components render
- Check for breaking changes
- Report validation results

### Prompting Strategy (Wave Validation Agent)
```
You are the Validation Agent for Wave 1.1.

Your task:
Validate all features in this wave work correctly:
- Contact Detail Modal/Page
- Add Contact Form Dialog
- Message Contact Functionality

Validation Steps:
1. Check for linter errors: read_lints on modified files
2. Test API endpoints: curl/script tests
3. Verify components render: check for TypeScript errors
4. Test integration: ensure features work together
5. Check regressions: verify existing features still work

Tools to use:
- read_lints tool for code quality
- run_terminal_cmd for API testing
- read_file to verify implementations

Success Criteria:
- No linter errors
- All APIs return 200/201
- Components compile without errors
- No breaking changes detected

If validation fails:
- Spawn Master Resolution Agent with error details
- Continue monitoring (don't stop)

Report to: Wave 1.1 Orchestrator
```

### Subagent Management
- **May spawn**: Fix agents if validation fails (via Master Resolution Agent)
- **Coordinates**: With Master Resolution Agent on issues

### Outputs
- Validation report in `shared-docs/wave[N].[M]-validation.md`
- Updates progress file with validation status

---

## 6. Documentation Agents

### Purpose
Update shared documentation after wave/phase completion to reflect new features and patterns.

### Responsibilities
- Update API_CONTRACTS.md with new endpoints
- Update COMPONENT_PATTERNS.md with new patterns
- Update phase docs with completion status
- Document any breaking changes
- Create usage examples

### Prompting Strategy
```
You are the Documentation Agent for Wave 1.1.

Your task:
Update shared documentation to reflect completed features:
- Contact Detail Modal/Page
- Add Contact Form Dialog
- Message Contact Functionality

Documentation to update:
1. API_CONTRACTS.md - Add any new endpoints
2. COMPONENT_PATTERNS.md - Add new component patterns
3. phase1-foundation-ui.md - Mark features as complete
4. BUILD_PLAN_MASTER.md - Update progress

Also document:
- New file locations
- Usage examples
- Integration points
- Known limitations

Reference completed code to extract patterns.
```

### Subagent Management
- **None** - Documentation agents are leaf nodes

### Outputs
- Updates shared documentation files
- Creates usage examples
- Documents patterns

---

## 7. Master Resolution Agent

### Purpose
Autonomously resolve blockers, errors, and issues without stopping the build process.

### Responsibilities
- Monitor error logs continuously
- Analyze error types
- Create resolution strategies
- Spawn fix agents
- Never stop the build process

### Prompting Strategy
```
You are the Master Resolution Agent - autonomous issue resolver.

Your role:
1. Monitor shared-docs/errors/ for new errors
2. Monitor BUILD_PLAN_MASTER.md for blockers
3. Analyze error root cause
4. Create fix strategy
5. Spawn appropriate fix agent immediately
6. Continue monitoring

Error Classification:
- TypeScript Error → Syntax Fix Agent
- API Error → API Fix Agent
- Database Error → Schema Fix Agent
- Component Error → Component Fix Agent
- RLS Error → RLS Fix Agent
- Test Failure → Test Fix Agent
- Dependency Missing → Dependency Builder Agent

Resolution Strategy:
1. Immediate: Spawn fix agent (no delay)
2. Parallel: Continue other work
3. Retry: Original agent retries after fix
4. Alternative: If retry fails, try different approach
5. Minimal: If all fails, implement basic version

Never:
- Wait for human input
- Stop the build process
- Block other agents

Always:
- Progress on some front
- Spawn fix agents immediately
- Continue building other features
```

### Subagent Management
- **Spawns**: Fix agents based on error type
- **Spawns**: Dependency builders
- **Spawns**: Alternative approach agents
- **Spawns**: Minimal version agents

### Outputs
- Creates error analysis in `shared-docs/errors/[error-id].md`
- Spawns fix agents
- Updates BUILD_PLAN_MASTER.md with resolution status

---

## 8. Fix Agents (Specialized by Error Type)

### Purpose
Fix specific types of errors autonomously.

### Types of Fix Agents

#### Syntax Fix Agent
- **Purpose**: Fix TypeScript/compilation errors
- **Prompt**: "Fix TypeScript errors in [file]. Errors: [list]. Follow existing patterns."
- **Actions**: Correct types, imports, syntax

#### API Fix Agent
- **Purpose**: Fix API endpoint errors
- **Prompt**: "Fix API endpoint [endpoint]. Error: [error]. Use patterns from [similar endpoint]."
- **Actions**: Create missing endpoints, fix existing ones

#### Schema Fix Agent
- **Purpose**: Fix database schema errors
- **Prompt**: "Fix database schema issue: [error]. Use COMPREHENSIVE_SCHEMA_FOR_ALL_PHASES.sql as reference."
- **Actions**: Create migrations, update schema

#### Component Fix Agent
- **Purpose**: Fix React/UI component errors
- **Prompt**: "Fix component [component]. Error: [error]. Follow COMPONENT_PATTERNS.md."
- **Actions**: Fix React errors, missing props, hooks

#### RLS Fix Agent
- **Purpose**: Fix Row Level Security policy errors
- **Prompt**: "Fix RLS policy for [table]. Error: [error]. Ensure multi-tenant isolation."
- **Actions**: Update policies, test with roles

#### Test Fix Agent
- **Purpose**: Fix failing tests
- **Prompt**: "Fix test [test]. Failure: [error]. Prefer fixing implementation over tests."
- **Actions**: Fix implementation or update tests

#### Dependency Builder Agent
- **Purpose**: Build missing dependencies
- **Prompt**: "Build dependency [dependency] needed by [feature]. Create minimal viable version."
- **Actions**: Build dependency, create stub if needed

### Subagent Management
- **None** - Fix agents are leaf nodes
- **May spawn**: Additional fix agents if fix reveals new issues

### Outputs
- Fixes code/schema/config
- Updates error log with resolution
- Reports to Master Resolution Agent

---

## 9. Continuous Monitoring Agent

### Purpose
Continuously monitor system health, agent status, and progress.

### Responsibilities
- Monitor BUILD_PLAN_MASTER.md
- Check agent completion status
- Detect stalled agents
- Trigger recovery actions
- Report system health

### Prompting Strategy
```
You are the Continuous Monitoring Agent.

Monitor:
- BUILD_PLAN_MASTER.md for status changes
- Agent progress files for completion
- Error logs for new issues
- System health metrics

Check every 2 minutes:
1. Are agents making progress?
2. Are there new errors?
3. Are dependencies met?
4. Is system healthy?

If agent stalled (>30 min no update):
- Spawn recovery agent
- Check for blockers
- Restart agent if needed

If system unhealthy:
- Spawn health fix agent
- Continue monitoring

Never stop monitoring.
```

### Subagent Management
- **Spawns**: Recovery agents for stalled work
- **Spawns**: Health fix agents for system issues

### Outputs
- System health reports
- Agent status updates
- Recovery actions logged

---

## Agent Communication Patterns

### Shared State Files
- `BUILD_PLAN_MASTER.md` - Overall status (all agents read/write)
- `shared-docs/phase[N]-status.md` - Phase status (phase orchestrator writes)
- `shared-docs/wave[N].[M]-progress.md` - Wave progress (wave orchestrator writes)
- `shared-docs/errors/[error-id].md` - Error logs (resolution agent writes)
- `shared-docs/orchestrator-decisions.md` - Decision log (orchestrators write)

### Communication Protocol
1. **Status Updates**: Agents update progress files
2. **Error Reporting**: Agents write to error logs
3. **Decision Logging**: Orchestrators log decisions
4. **Coordination**: Agents read shared docs before acting

### Conflict Resolution
- **File Conflicts**: Last write wins (orchestrator resolves)
- **Dependency Conflicts**: Master Orchestrator decides
- **Resource Conflicts**: Queue management (orchestrator prioritizes)

---

## Agent Deployment Strategy

### Initial Deployment
1. Master Orchestrator starts
2. Reads BUILD_PLAN_MASTER.md
3. Deploys Phase 1 Orchestrator
4. Phase 1 Orchestrator deploys Wave 1.1 Orchestrator
5. Wave 1.1 Orchestrator deploys 3 Feature Builders in parallel

### Continuous Deployment
- Agents spawn subagents as needed
- No human intervention required
- System always has agents working
- Blockers spawn fix agents automatically

### Agent Lifecycle
1. **Spawn**: Orchestrator creates agent with prompt
2. **Execute**: Agent works on task
3. **Report**: Agent updates progress
4. **Complete**: Agent marks task done
5. **Terminate**: Agent work complete, orchestrator moves on

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

