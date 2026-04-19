# 🤖 AI Assistant Market

A full-stack marketplace where small businesses can **hire, deploy, and manage AI employees** — without worrying about technical details. Browse pre-built AI agents for common tasks or create custom agents tailored to your workflows.

> **Status:** In active development · Local testing stage · Not yet deployed to production

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

---

## ✨ Features

### 🏪 Marketplace
- Browse a curated catalog of pre-built AI employees (Customer Support, Data Analyst, Bookkeeper, IT Helpdesk, and more)
- Category-based filtering and search
- Detailed employee profiles with capabilities, pricing, and ratings
- Light & dark mode with seamless theme switching

### 🚀 3-Stage Deployment Flow
1. **Select & Configure** — Choose tools, data sources, knowledge base, and schedule
2. **Review & Recommend** — AI-powered model recommendation engine analyzes task complexity and suggests the optimal model
3. **Deploy** — One-click deployment with real-time status tracking

### 💬 Real-Time AI Chat
- Multi-turn conversations with deployed AI agents
- Context preserved across messages
- Knowledge base injection (agents reference your configured data)
- Per-message response metrics (tokens, latency, model used)

### 🧠 Smart Model Recommendation Engine
- Complexity scoring algorithm evaluates: agent type, tools, data sources, knowledge base size, schedule
- Automatically routes simple tasks to cost-effective models (GPT-4o Mini) and complex tasks to more capable models (GPT-4o)
- Server-side authoritative (clients can't override model selection)
- Displays reasoning, cost estimates, and alternatives in the deploy review step

### 📊 Usage Metering & Quota System
- Real-time token usage tracking per deployment and per model
- Atomic quota reservation — reserve → LLM call → reconcile (no TOCTOU races)
- Tiered plans: Free (100K tokens/mo), Starter (500K), Professional (2M), Enterprise (10M)
- Automatic monthly quota reset
- Per-request cost tracking in USD
- 429 responses when quota is exceeded

### 📈 Dashboard & Performance Tracking
- Overview dashboard with total deployments, active agents, tasks completed, response times
- Individual deployment performance metrics
- Task logs with status, duration, and token usage

### 🔐 Authentication
- Custom JWT authentication (HS256, httpOnly cookies)
- Login/signup with email & password (bcrypt hashed)
- Protected routes with middleware
- Auth context provider for client-side state

### 🎨 UI/UX
- Fully responsive dark & light themes (CSS custom properties)
- Animated cards, gradients, and hover effects
- Category-specific color schemes and avatars
- Consistent styling across all pages

---

## 🏗️ Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Framework     | Next.js 16 (App Router, Turbopack)  |
| Language      | TypeScript 5                        |
| Styling       | Tailwind CSS 4                      |
| Database      | SQLite via better-sqlite3           |
| Auth          | Custom JWT (jose + bcrypt)          |
| LLM Provider  | Azure OpenAI (REST API, no SDK)     |
| State Mgmt    | React Context + Server Components   |

---

## 📁 Project Structure

```
ai-assistant-market/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── api/
│   │   │   ├── auth/           # Login, signup, logout, session endpoints
│   │   │   ├── deployments/    # CRUD, chat, model recommendation
│   │   │   ├── employees/      # Marketplace employee catalog
│   │   │   ├── purchases/      # Purchase/hire flow
│   │   │   └── usage/          # Usage summary & quota status
│   │   ├── dashboard/          # User dashboard
│   │   ├── deploy/[id]/        # 3-stage deployment wizard + chat
│   │   ├── marketplace/        # Employee catalog & detail pages
│   │   └── performance/        # Performance tracking
│   ├── components/             # Shared UI components (Navbar, ThemeProvider, etc.)
│   ├── data/                   # Database initialization & seed data
│   └── lib/
│       ├── agents/             # AI agent engine
│       │   ├── azure-openai-provider.ts  # Real Azure OpenAI integration
│       │   ├── base-agent.ts             # Agent executor with metering
│       │   ├── llm-provider.ts           # Provider factory & mock provider
│       │   ├── model-recommender.ts      # Complexity scoring & model selection
│       │   ├── model-registry.ts         # Model configurations & capabilities
│       │   └── usage-meter.ts            # Quota reservation & usage tracking
│       ├── auth.ts             # JWT helpers
│       └── db.ts               # SQLite connection & migration runner
├── data/
│   └── migrations/             # SQL migration files (auto-applied on startup)
│       ├── 001_initial_schema.sql
│       ├── 002_agent_backend.sql
│       └── 003_usage_metering.sql
├── .env.example                # Template for environment variables
└── public/                     # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/nanospinx1/ai-assistant-market.git
cd ai-assistant-market

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API keys and settings

# Start the development server
npm run dev
```

The app will be available at **http://localhost:3001** (or the port shown in the terminal).

### Environment Variables

| Variable                        | Required | Description                                         |
|---------------------------------|----------|-----------------------------------------------------|
| `AUTH_SECRET`                   | Yes      | Secret key for JWT signing                          |
| `NEXTAUTH_URL`                  | Yes      | Base URL of the application                         |
| `LLM_PROVIDER`                  | Yes      | `azure-openai` for real API calls, `mock` for demo  |
| `AZURE_OPENAI_ENDPOINT`        | If real  | Azure OpenAI resource endpoint URL                  |
| `AZURE_OPENAI_API_KEY_PRIMARY`  | If real  | Primary API key for Azure OpenAI                    |
| `AZURE_OPENAI_API_KEY_SECONDARY`| If real  | Secondary API key (optional, for multi-region)      |

### Demo Credentials

When running in demo mode, use these credentials to log in:

| Email              | Password  |
|--------------------|-----------|
| `demo@company.com` | `demo123` |

---

## 🔧 Architecture

### Deployment Options
The platform supports two deployment models:

1. **Fully Managed** — We handle everything: infrastructure, API keys, model selection, and scaling. Users just configure their agent and deploy.
2. **Usage-Based** — Token consumption is tracked per deployment. Free tier included; upgrade for higher limits.

### Agent Engine Pipeline
```
User Message
    → BaseAgent.chat()
        → resolveModel() — reads deployment's assigned model
        → reserveQuota() — atomic token reservation
        → AzureOpenAIProvider.generate() — real LLM call
        → reconcileUsage() — log actual tokens, release reservation
    → Response with metrics
```

### Model Recommendation Flow
```
Deploy Request
    → Extract: agent type, tools, data sources, knowledge size, schedule
    → Score complexity (1-10 scale)
    → Map score to tier: <3.5 → Mini, ≥3.5 → Standard
    → Return: recommended model, reasoning, cost estimate, alternatives
```

### Database Migrations
Migrations are auto-applied on server startup via `src/lib/db.ts`. Each migration file in `data/migrations/` is tracked and only runs once.

---

## 📋 API Endpoints

| Method | Path                                    | Description                        |
|--------|-----------------------------------------|------------------------------------|
| POST   | `/api/auth/login`                       | User login                         |
| POST   | `/api/auth/signup`                      | User registration                  |
| POST   | `/api/auth/logout`                      | User logout                        |
| GET    | `/api/auth/session`                     | Current session info               |
| GET    | `/api/employees`                        | List marketplace employees         |
| GET    | `/api/employees/[id]`                   | Employee details                   |
| POST   | `/api/purchases`                        | Purchase/hire an employee          |
| GET    | `/api/deployments`                      | List user's deployments            |
| POST   | `/api/deployments`                      | Create deployment (with model rec) |
| PATCH  | `/api/deployments/[id]`                 | Update deployment status           |
| POST   | `/api/deployments/[id]/chat`            | Chat with deployed agent           |
| GET    | `/api/deployments/[id]/conversations`   | List conversations                 |
| GET    | `/api/deployments/[id]/tasks`           | List task logs                     |
| POST   | `/api/deployments/recommend-model`      | Preview model recommendation       |
| GET    | `/api/usage`                            | Usage summary & quota status       |

---

## 🗺️ Roadmap

- [ ] Custom agent builder with marketplace publishing
- [ ] Admin panel for agent submission approval
- [ ] Bring Your Own Key (BYOK) for enterprise customers
- [ ] Additional LLM providers (Anthropic, Groq, AWS Bedrock)
- [ ] Usage analytics dashboard with charts
- [ ] Settings & profile page
- [ ] Mobile responsive polish
- [ ] Production deployment (Vercel / Azure)

---

## 📄 License

Private — All rights reserved.

---

## 🙏 Acknowledgments

Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service), and [SQLite](https://www.sqlite.org/).
