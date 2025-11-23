# Name Brand Integrations - Complete List

**Date**: 09:46:59 Nov 23, 2025  
**Purpose**: Comprehensive list of all name brand integrations, third-party services, and providers used in the CRM application

---

## AI/LLM Providers

### 1. **OpenAI**
- **Products**: GPT-4o, GPT-4o-mini
- **Use Cases**: Draft generation, Summary, General AI tasks, Complex reasoning, Vision processing
- **Status**: ✅ Active
- **Integration**: Via `@ai-sdk/openai` package and OpenAI API
- **Icon Name**: `openai` or `chatgpt`

### 2. **Anthropic**
- **Products**: Claude 3.5 Sonnet
- **Use Cases**: Complex reasoning, General AI tasks
- **Status**: ✅ Active
- **Integration**: Via Anthropic API
- **Icon Name**: `anthropic` or `claude`

### 3. **Google Gemini**
- **Products**: Gemini Pro
- **Use Cases**: General AI tasks, Draft generation
- **Status**: ✅ Active
- **Integration**: Via Google AI API
- **Icon Name**: `google_gemini` or `gemini`

### 4. **Zai GLM**
- **Products**: GLM 4.6
- **Use Cases**: General AI tasks, Draft generation, Complex reasoning
- **Status**: ✅ Active
- **Integration**: Via Zai API
- **Icon Name**: `zai_glm` or `glm`

---

## Email Providers

### 5. **Resend**
- **Products**: Resend.com (Transactional Email Service)
- **Use Cases**: Primary email sending, Inbound webhooks, Email delivery
- **Status**: ✅ Active (Default)
- **Integration**: Via `resend` npm package
- **Icon Name**: `resend`

### 6. **Gmail / Google Workspace**
- **Products**: Gmail API, Gmail Workspace
- **Use Cases**: Send emails via Gmail, Sync emails, OAuth integration
- **Status**: ✅ Active
- **Integration**: Via `googleapis` and `google-auth-library` packages
- **Icon Name**: `gmail` or `google_workspace`

### 7. **Microsoft 365 / Outlook**
- **Products**: Microsoft Graph API, Outlook, Microsoft 365
- **Use Cases**: Send emails via Outlook, Sync emails, OAuth integration
- **Status**: ✅ Active
- **Integration**: Via `@microsoft/microsoft-graph-client` and `@azure/msal-node` packages
- **Icon Name**: `microsoft_365` or `outlook` or `microsoft`

### 8. **SendGrid** (Supported but not implemented)
- **Products**: SendGrid Email API
- **Use Cases**: Email sending (alternative to Resend)
- **Status**: ⚠️ Schema supports it, not yet implemented
- **Icon Name**: `sendgrid`

### 9. **Mailgun** (Supported but not implemented)
- **Products**: Mailgun Email API
- **Use Cases**: Email sending (alternative to Resend)
- **Status**: ⚠️ Schema supports it, not yet implemented
- **Icon Name**: `mailgun`

---

## Payment Providers

### 10. **Stripe**
- **Products**: Stripe Connect (Standard), Stripe Payments
- **Use Cases**: Payment processing, Invoice payments, Webhook handling
- **Status**: ✅ Active
- **Integration**: Via `stripe` npm package
- **Icon Name**: `stripe`

---

## Voice & Communication

### 11. **ElevenLabs**
- **Products**: ElevenLabs Voice Agent, Text-to-Speech, Voice AI
- **Use Cases**: Voice commands, Natural language interface, Voice agent integration
- **Status**: ✅ Active
- **Integration**: Via webhook endpoint `/api/webhooks/elevenlabs` and MCP server
- **Icon Name**: `elevenlabs`

---

## Infrastructure & Platform

### 12. **Supabase**
- **Products**: Supabase (PostgreSQL, GoTrue Auth, Realtime, Storage, Edge Functions)
- **Use Cases**: Database, Authentication, Real-time updates, File storage, Serverless functions
- **Status**: ✅ Active (Core Infrastructure)
- **Integration**: Via `@supabase/supabase-js`, `@supabase/ssr`, `@supabase/auth-helpers-nextjs` packages
- **Icon Name**: `supabase`

### 13. **Vercel**
- **Products**: Vercel (Hosting, Edge Functions, Deployment)
- **Use Cases**: Application hosting, Edge runtime, CI/CD
- **Status**: ✅ Active (Deployment Platform)
- **Integration**: Via Vercel AI SDK (`ai` package)
- **Icon Name**: `vercel`

### 14. **Next.js**
- **Products**: Next.js 15 (App Router)
- **Use Cases**: Frontend framework, API routes, Server-side rendering
- **Status**: ✅ Active (Core Framework)
- **Integration**: Via `next` package
- **Icon Name**: `nextjs` or `next`

---

## UI & Design

### 15. **Tailwind CSS**
- **Products**: TailwindCSS
- **Use Cases**: Styling, Utility-first CSS framework
- **Status**: ✅ Active
- **Integration**: Via `tailwindcss` package
- **Icon Name**: `tailwindcss` or `tailwind`

### 16. **Shadcn/UI**
- **Products**: Shadcn UI Components (built on Radix UI)
- **Use Cases**: UI component library, Accessible components
- **Status**: ✅ Active
- **Integration**: Via `@radix-ui/*` packages
- **Icon Name**: `shadcn` or `radix_ui`

### 17. **Radix UI**
- **Products**: Radix UI Primitives
- **Use Cases**: Accessible UI components (dialogs, dropdowns, tabs, etc.)
- **Status**: ✅ Active
- **Integration**: Via multiple `@radix-ui/react-*` packages
- **Icon Name**: `radix_ui`

### 18. **Lucide React**
- **Products**: Lucide Icons
- **Use Cases**: Icon library
- **Status**: ✅ Active
- **Integration**: Via `lucide-react` package
- **Icon Name**: `lucide` or `lucide_icons`

---

## Data & Analytics

### 19. **Recharts**
- **Products**: Recharts (React Charting Library)
- **Use Cases**: Data visualization, Charts, Graphs, Analytics displays
- **Status**: ✅ Active
- **Integration**: Via `recharts` package
- **Icon Name**: `recharts`

---

## Development Tools

### 20. **TypeScript**
- **Products**: TypeScript
- **Use Cases**: Type-safe JavaScript, Development
- **Status**: ✅ Active
- **Integration**: Via `typescript` package
- **Icon Name**: `typescript` or `ts`

### 21. **Playwright**
- **Products**: Playwright (Testing Framework)
- **Use Cases**: End-to-end testing, Browser automation
- **Status**: ✅ Active (Dev Tool)
- **Integration**: Via `@playwright/test` and `playwright` packages
- **Icon Name**: `playwright`

---

## Integration Platforms (Mentioned/Planned)

### 22. **Zapier** (Mentioned in docs)
- **Products**: Zapier (Automation Platform)
- **Use Cases**: Workflow automation, Third-party integrations
- **Status**: ⚠️ Mentioned in `ZAPIER_MCP_SETUP.md`, not fully implemented
- **Icon Name**: `zapier`

---

## Summary by Category

### AI/LLM Providers (4)
1. OpenAI (GPT-4o, GPT-4o-mini)
2. Anthropic (Claude 3.5 Sonnet)
3. Google Gemini (Gemini Pro)
4. Zai GLM (GLM 4.6)

### Email Providers (5)
5. Resend (Primary)
6. Gmail / Google Workspace
7. Microsoft 365 / Outlook
8. SendGrid (Supported, not implemented)
9. Mailgun (Supported, not implemented)

### Payment Providers (1)
10. Stripe

### Voice & Communication (1)
11. ElevenLabs

### Infrastructure & Platform (3)
12. Supabase
13. Vercel
14. Next.js

### UI & Design (4)
15. Tailwind CSS
16. Shadcn/UI
17. Radix UI
18. Lucide React

### Data & Analytics (1)
19. Recharts

### Development Tools (2)
20. TypeScript
21. Playwright

### Integration Platforms (1)
22. Zapier (Mentioned, not fully implemented)

---

## Total Integrations

- **Active Integrations**: 19
- **Supported but Not Implemented**: 3 (SendGrid, Mailgun, Zapier)
- **Total Name Brand Services**: 22

---

## Icon Naming Convention

All integration icons should use **snake_case** naming:

- `openai`
- `anthropic`
- `google_gemini`
- `zai_glm`
- `resend`
- `gmail`
- `google_workspace`
- `microsoft_365`
- `outlook`
- `microsoft`
- `sendgrid`
- `mailgun`
- `stripe`
- `elevenlabs`
- `supabase`
- `vercel`
- `nextjs`
- `tailwindcss`
- `shadcn`
- `radix_ui`
- `lucide`
- `recharts`
- `typescript`
- `playwright`
- `zapier`

---

## Integration Status Legend

- ✅ **Active** - Fully implemented and in use
- ⚠️ **Supported** - Schema/architecture supports it, not yet implemented
- 📋 **Mentioned** - Referenced in documentation, planned

---

**Last Updated**: 09:46:59 Nov 23, 2025

---

09:46:59 Nov 23, 2025

