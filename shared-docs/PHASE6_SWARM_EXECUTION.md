# Phase 6 Swarm Execution Plan: Marketing Features UI

## Status Assessment

### ✅ Already Complete
- **Email Templates API**: Full CRUD + preview endpoint
- **Contact Tags API**: Full CRUD + bulk operations
- **Campaigns API**: Full CRUD + send/pause/resume + recipients management
- **Database Schema**: All tables exist and ready

### 🔄 Needs Implementation
- Email Templates management UI
- Contact Tags management UI  
- Campaigns management UI
- Integration into dashboard navigation
- Tag assignment in contact detail modal

## Swarm Wave Structure

### Wave 1: Email Templates UI (2 agents)
**Goal**: Complete email template management interface

**Agent 1.1: Email Templates List Page**
- Create `/app/(dashboard)/marketing/email-templates/page.tsx`
- List all templates with filters (type, active status)
- Create/edit/delete template actions
- Preview template functionality
- Template variable documentation

**Agent 1.2: Email Template Editor Component**
- Create `components/marketing/email-template-editor.tsx`
- Rich text editor or code editor
- Variable insertion UI
- Preview pane
- Save/update functionality

### Wave 2: Contact Tags UI (2 agents)
**Goal**: Complete contact tagging system

**Agent 2.1: Contact Tags Management Page**
- Create `/app/(dashboard)/marketing/tags/page.tsx`
- List all tags with color coding
- Create/edit/delete tags
- Tag usage statistics
- Bulk tag operations

**Agent 2.2: Tag Assignment in Contacts**
- Enhance `components/contacts/contact-detail-modal.tsx`
- Add tag assignment UI
- Tag display in contact list
- Filter contacts by tags

### Wave 3: Campaigns UI (3 agents)
**Goal**: Complete campaign management interface

**Agent 3.1: Campaigns List Page**
- Create `/app/(dashboard)/marketing/campaigns/page.tsx`
- List campaigns with status filters
- Campaign stats display (sent, opened, clicked)
- Create new campaign button

**Agent 3.2: Campaign Editor Component**
- Create `components/marketing/campaign-editor.tsx`
- Campaign form (name, type, template selection)
- Target segment configuration
- Schedule settings
- Recipient management

**Agent 3.3: Campaign Detail & Analytics**
- Create `components/marketing/campaign-detail.tsx`
- Campaign stats dashboard
- Recipient list with status
- Send/pause/resume controls
- Performance metrics

### Wave 4: Integration & Polish (2 agents)
**Goal**: Integrate all features and polish UX

**Agent 4.1: Navigation Integration**
- Add Marketing section to dashboard layout
- Add routes for all marketing pages
- Update navigation menu

**Agent 4.2: Testing & Validation**
- Test all CRUD operations
- Test campaign sending
- Test tag assignments
- Validate template previews
- Check responsive design

## Success Criteria

### Email Templates
- [ ] List page displays all templates
- [ ] Can create new template
- [ ] Can edit existing template
- [ ] Can delete template
- [ ] Preview works with variables
- [ ] Template types filter works

### Contact Tags
- [ ] Tags page displays all tags
- [ ] Can create/edit/delete tags
- [ ] Tags display in contact detail
- [ ] Can assign tags to contacts
- [ ] Can filter contacts by tags
- [ ] Bulk tag assignment works

### Campaigns
- [ ] Campaigns list displays all campaigns
- [ ] Can create new campaign
- [ ] Can edit campaign
- [ ] Can send campaign
- [ ] Can pause/resume campaign
- [ ] Stats display correctly
- [ ] Recipient management works

## Dependencies

- All APIs already exist ✅
- Database schema complete ✅
- UI components exist ✅
- Authentication working ✅

## Execution Order

1. **Wave 1** (Email Templates) - Can run in parallel
2. **Wave 2** (Contact Tags) - Can run in parallel with Wave 1
3. **Wave 3** (Campaigns) - Depends on Wave 1 (needs templates)
4. **Wave 4** (Integration) - Depends on all waves

## Files to Create

### Pages
- `app/(dashboard)/marketing/email-templates/page.tsx`
- `app/(dashboard)/marketing/tags/page.tsx`
- `app/(dashboard)/marketing/campaigns/page.tsx`
- `app/(dashboard)/marketing/campaigns/[id]/page.tsx`

### Components
- `components/marketing/email-template-editor.tsx`
- `components/marketing/email-template-dialog.tsx`
- `components/marketing/tag-manager.tsx`
- `components/marketing/tag-selector.tsx`
- `components/marketing/campaign-editor.tsx`
- `components/marketing/campaign-detail.tsx`
- `components/marketing/campaign-stats.tsx`

## Notes

- All APIs are already implemented
- Focus on UI/UX implementation
- Follow existing component patterns
- Use existing UI components from `components/ui/`
- Ensure RLS compliance (handled by APIs)
- Add proper error handling
- Include loading states

