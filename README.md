# CRM-AI PRO

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-proprietary-red.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)
![Railway](https://img.shields.io/badge/Railway-deployed-blueviolet.svg)

**AI-Native Business Operating System for Service Industries**

[Features](#-key-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo) • [Support](#-support)

</div>

---

## 🚀 Overview

CRM-AI PRO is a comprehensive, AI-powered CRM platform designed specifically for service industry businesses (plumbing, HVAC, electrical, etc.). It combines intelligent customer relationship management, field technician dispatch, real-time voice AI agents, and advanced analytics in a mobile-first, PWA-enabled application.

### Why CRM-AI PRO?

- **🤖 AI-First Architecture**: Built with AI at the core, not bolted on
- **📱 Mobile-First**: Dedicated mobile interfaces for field technicians and sales teams
- **🎯 Role-Based**: Customized UX for owners, admins, dispatchers, techs, and sales
- **⚡ Real-Time**: WebSocket-powered live updates and notifications
- **🔒 Enterprise-Grade**: Secure, scalable, and production-ready
- **💰 Cost-Optimized**: Intelligent LLM routing saves 90%+ on AI costs

---

## ✨ Key Features

### Core Platform
- **Multi-Role Dashboard System** - Owner, admin, dispatcher, technician, and sales
- **Real-Time Messaging** - Inbox with SMS/email integration and AI-powered responses
- **Customer Management** - Complete contact lifecycle with interaction history
- **Job Dispatch & Tracking** - Smart scheduling and field technician management
- **Voice AI Agent** - ElevenLabs-powered conversational AI for customer interactions
- **Advanced Analytics** - Revenue tracking, conversion metrics, technician performance

### AI Capabilities
- **Intelligent LLM Router** - Automatic provider selection (OpenAI, Anthropic, Google)
- **Smart Cost Optimization** - 90% reduction through strategic model routing
- **Voice Agent** - Natural conversation with automatic call handling
- **Email Auto-Draft** - AI-generated professional responses
- **Sentiment Analysis** - Customer mood tracking and alerts

### Mobile Experience
- **Progressive Web App (PWA)** - Install on any device, works offline
- **Dedicated Mobile Routes** - `/m/` routes for field-optimized interfaces
- **Tech Dashboard** - Job queue, customer info, notes, and navigation
- **Sales Tools** - Client briefings, meeting prep, and instant quotes

### Developer Experience
- **TypeScript Throughout** - Full type safety and IntelliSense
- **Component Library** - Radix UI with custom design system
- **Hot Reload** - Instant feedback during development
- **Comprehensive Docs** - API references, guides, and examples

---

## 🎯 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- PostgreSQL database (Supabase recommended)
- API keys: OpenAI, Anthropic, ElevenLabs (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/CaptainPhantasy/crm-ai-pro.git
cd crm-ai-pro

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npm run setup:db

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Configuration

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers (At least one required)
OPENAI_API_KEY=sk-proj-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
GOOGLE_GEMINI_API_KEY=xxxxx

# Voice AI (Optional)
ELEVENLABS_API_KEY=sk_xxxxx
ELEVENLABS_KEY_ID=xxxxx

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📱 Demo

### Live Demo
🔗 **[https://crm-ai-pro-production.up.railway.app](https://crm-ai-pro-production.up.railway.app)**

### Test Credentials
```
Email: demo@example.com
Password: demo123
```

### Screenshots

<details>
<summary>Click to view screenshots</summary>

#### Desktop Dashboard
![Desktop Dashboard](docs/screenshots/dashboard.png)

#### Mobile Tech View
![Mobile Tech View](docs/screenshots/mobile-tech.png)

#### Voice Agent Interface
![Voice Agent](docs/screenshots/voice-agent.png)

</details>

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript 5.9 |
| **Styling** | Tailwind CSS, Radix UI, Custom Design Tokens |
| **State Management** | React Query, Context API |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth (JWT) |
| **Real-Time** | Supabase Realtime, WebSockets |
| **AI/LLM** | OpenAI, Anthropic, Google Gemini |
| **Voice** | ElevenLabs React SDK |
| **Deployment** | Railway (auto-deploy from GitHub) |
| **Monitoring** | Built-in analytics, error tracking |

### System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Client Layer                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ Owner   │  │ Admin   │  │ Tech    │  │ Sales   │     │
│  │ Desktop │  │ Desktop │  │ Mobile  │  │ Mobile  │     │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘     │
└───────┼───────────┼────────────┼────────────┼───────────┘
        │           │            │            │
        └───────────┴────────────┴────────────┘
                    │
        ┌───────────▼───────────────────────────────┐
        │         Next.js Application                │
        │  ┌──────────────────────────────────────┐ │
        │  │ API Layer                            │ │
        │  │  • /api/llm (AI Router)              │ │
        │  │  • /api/conversations                │ │
        │  │  • /api/jobs                         │ │
        │  │  • /api/contacts                     │ │
        │  └──────────────────────────────────────┘ │
        └────────────────┬──────────────────────────┘
                         │
        ┌────────────────▼─────────────────────────┐
        │        Service Layer                      │
        │  ┌───────────┐  ┌──────────┐  ┌────────┐ │
        │  │ LLM       │  │ Auth     │  │ Real-  │ │
        │  │ Router    │  │ Helper   │  │ time   │ │
        │  └───────────┘  └──────────┘  └────────┘ │
        └───────────────────┬──────────────────────┘
                            │
        ┌───────────────────▼──────────────────────┐
        │      Data Layer (Supabase)                │
        │  ┌──────────┐  ┌──────────┐  ┌────────┐  │
        │  │ Users    │  │ Contacts │  │ Jobs   │  │
        │  │ Accounts │  │ Messages │  │ Calls  │  │
        │  └──────────┘  └──────────┘  └────────┘  │
        └──────────────────────────────────────────┘
```

---

## 📚 Documentation

### User Guides
- 📖 [**User Guide**](docs/USER_GUIDE.md) - Complete user manual
- 🎓 [**Getting Started**](docs/GETTING_STARTED.md) - Onboarding tutorial
- 📱 [**Mobile Guide**](docs/MOBILE_GUIDE.md) - Mobile app usage

### Developer Guides
- 🔧 [**API Reference**](docs/API_REFERENCE.md) - Complete API documentation
- 🏗️ [**Architecture**](docs/ARCHITECTURE.md) - System design and patterns
- 🎨 [**Design System**](docs/DESIGN_SYSTEM.md) - UI components and theming
- 🧪 [**Testing Guide**](docs/TESTING.md) - Testing strategies

### Administrator Guides
- ⚙️ [**Admin Guide**](docs/ADMIN_GUIDE.md) - System configuration
- 📊 [**Operations Guide**](docs/OPERATIONS_GUIDE.md) - Daily operations
- 🔒 [**Security Guide**](docs/SECURITY.md) - Security best practices
- 🚨 [**Troubleshooting**](docs/TROUBLESHOOTING_RUNBOOK.md) - Common issues

### Deployment
- 🚀 [**Deployment Guide**](docs/DEPLOYMENT.md) - Production deployment
- 🐳 [**Docker Guide**](docs/DOCKER.md) - Container deployment
- ☁️ [**Railway Deployment**](docs/RAILWAY.md) - Railway-specific guide

---

## 🔐 Security

- **🔒 Encryption**: All sensitive data encrypted at rest and in transit
- **🛡️ Authentication**: JWT-based auth with refresh tokens
- **👥 RBAC**: Role-based access control (owner, admin, dispatcher, tech, sales)
- **🔑 API Keys**: Securely stored and never exposed to client
- **📝 Audit Logging**: Complete audit trail of all actions
- **🚫 Rate Limiting**: Prevents abuse and ensures fair usage

See [SECURITY.md](docs/SECURITY.md) for detailed security practices.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Type check
npm run type-check
```

---

## 🚀 Deployment

### Railway (Recommended)

Railway auto-deploys from GitHub on every push to `main`:

```bash
# Deployment is automatic - just push to GitHub
git push origin main

# Railway will:
# 1. Detect push via webhook
# 2. Build using Nixpacks
# 3. Run tests (if configured)
# 4. Deploy to production
# 5. Update environment variables
```

### Manual Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

---

## 📊 Performance

- **⚡ Load Time**: <2s initial load, <500ms navigation
- **📱 Mobile Score**: 95+ on Lighthouse
- **♿ Accessibility**: WCAG 2.1 AA compliant
- **🎯 SEO Score**: 100/100 on major pages
- **💾 Bundle Size**: <200KB gzipped initial bundle
- **🔄 Cache Hit Rate**: 90%+ on static assets

---

## 🗺️ Roadmap

See [CHANGELOG.md](CHANGELOG.md) for version history.

### ✅ v1.0.0 (Current)
- Core CRM functionality
- Multi-role authentication
- Mobile PWA support
- Voice AI integration
- Real-time messaging

### 🔜 v1.1.0 (Next Release)
- Advanced analytics dashboards
- Calendar/scheduling integration
- Automated workflows
- Custom reporting

### 🔮 Future
- Multi-language support
- White-label capabilities
- Mobile native apps (iOS/Android)
- Advanced AI automation

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: restructure code
test: add tests
chore: update tooling
```

---

## 📄 License

Proprietary - All Rights Reserved

Copyright © 2025 Legacy AI. Unauthorized copying, distribution, or modification of this software is strictly prohibited.

---

## 💬 Support

### Community
- 📧 **Email**: douglas.talley@legacyai.space
- 💬 **Discord**: [Join our community](https://discord.gg/crm-ai-pro)
- 🐛 **Issues**: [GitHub Issues](https://github.com/CaptainPhantasy/crm-ai-pro/issues)

### Professional Support
- 🏢 **Enterprise Support**: Contact for SLA-backed support
- 📚 **Training**: [Book a training session](https://calendly.com/crm-ai-pro)
- 💼 **Consulting**: Custom development and integrations available

---

## 🙏 Acknowledgments

Built with these amazing open-source projects:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Database and auth
- [Radix UI](https://radix-ui.com/) - Accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [ElevenLabs](https://elevenlabs.io/) - Voice AI
- [Vercel AI SDK](https://sdk.vercel.ai/) - LLM integration

---

<div align="center">

**Made with ❤️ by [Legacy AI](https://legacyai.space)**

[Website](https://legacyai.space) • [Documentation](docs/) • [Changelog](CHANGELOG.md)

⭐ Star us on GitHub if you find this project useful!

</div>
