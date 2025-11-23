# Natural Language API Audit - Agent Coordination

**Date**: 2025-01-XX  
**Objective**: Identify EVERY possible action/workflow that needs API support for natural language interface  
**Perspective**: SMB owner/operator with salespeople, field agents, and dispatchers

---

## Agent Assignments

### Wave 1: Role-Based Workflow Analysis
- **Agent 1.1**: Dispatcher workflows and operations
- **Agent 1.2**: Field agent workflows and operations
- **Agent 1.3**: Salesperson workflows and operations
- **Agent 1.4**: Owner/admin workflows and operations

### Wave 2: Functional Area Analysis
- **Agent 2.1**: Error handling and edge cases
- **Agent 2.2**: Search and filtering scenarios
- **Agent 2.3**: Reporting and analytics queries
- **Agent 2.4**: Bulk operations and batch processing

### Wave 3: Integration & Communication
- **Agent 3.1**: Integration workflows (email, phone, etc.)
- **Agent 3.2**: Notification and alert workflows
- **Agent 3.3**: Multi-step workflows and sequences

### Wave 4: Data & State Management
- **Agent 4.1**: Data validation and verification
- **Agent 4.2**: State transitions and status changes
- **Agent 4.3**: Relationship management (contacts-jobs-conversations)

---

## Success Criteria

Each agent must identify:
1. **All user actions** in their assigned area
2. **All workflows** (multi-step processes)
3. **All queries** (read operations)
4. **All mutations** (write operations)
5. **All edge cases** (error scenarios, validations)
6. **Missing API endpoints** for each identified action

---

## Shared Findings Format

```markdown
### [Agent Name] - [Area]

#### Actions Identified:
1. [Action description]
   - Current API: [endpoint or "MISSING"]
   - Natural language example: "[user would say...]"
   - Priority: HIGH/MEDIUM/LOW

#### Missing APIs:
- [List of missing endpoints]
```

---

## Coordination Rules

1. All agents update this document with findings
2. Agents check for duplicates before adding
3. Use consistent formatting
4. Mark findings as VERIFIED or NEEDS_REVIEW
5. Include natural language examples for each action

---

## Progress Tracking

- [ ] Wave 1 Complete
- [ ] Wave 2 Complete
- [ ] Wave 3 Complete
- [ ] Wave 4 Complete
- [ ] All missing APIs identified
- [ ] Implementation plan created

