# 🤖 AI Assistant Market

A full-stack marketplace where small businesses can **hire, deploy, and manage AI employees** — without worrying about technical details. Browse pre-built AI agents, create custom agents tailored to your workflows, publish them to the community marketplace, and connect real tools like email, CRM, and calendar.

> **Status:** In active development · Local testing stage · Not yet deployed to production

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

---

## ✨ Features

### 🏪 Marketplace
- Browse **10 pre-built AI employees** across 8 categories (Customer Support, Sales Rep, Bookkeeper, Data Analyst, Content Writer, Social Media Manager, HR Assistant, IT Helpdesk, Project Manager, Virtual Receptionist)
- Category-based filtering and search (including a "Community" tab for user-published agents)
- Detailed employee profiles with capabilities, pricing, and ratings
- Community agents display a green "Community" badge with portfolio info (specialty, tools, use cases)
- **Privacy-first**: Marketplace shows only public agents — private custom agents never appear
- Light & dark mode with seamless theme switching

### 🧠 Data-Driven Agent Prompt System
- Each of the 10 agent types has a unique, professionally crafted system prompt defined in `agent-prompts.ts`
- Prompts include: base personality, default knowledge, tool-specific instructions, and data source instructions
- Customer configuration (tools, data sources, schedules, custom instructions) is dynamically injected into the prompt at runtime via `buildFullSystemPrompt()`
- Canonical agent type IDs used consistently across the entire codebase

### 🚀 3-Stage Deployment Flow
1. **Select & Configure** — Choose tools, data sources, knowledge base, and schedule
2. **Review & Recommend** — AI-powered model recommendation engine analyzes task complexity and suggests the optimal model
3. **Deploy** — One-click deployment with real-time status tracking
- **Name Your Employee** — Give your AI employee a human name (e.g., "Sarah"); agent type becomes their job title
- Consistent flow for both prebuilt and custom agents
- Knowledge is seeded at deployment creation time (not just activation)
- Agent snapshot frozen at deploy time so later edits don't affect running deployments

### 💬 Real-Time AI Chat with Function Calling
- Multi-turn conversations with deployed AI agents
- **Function calling support** — agents can invoke tools (email, CRM, calendar) during conversations
- Up to 5 tool-calling rounds per message (LLM calls tool → executes → feeds result back → LLM continues)
- Context preserved across messages
- Knowledge base injection (agents reference your configured data)
- Per-message response metrics (tokens, latency, model used, tool rounds)

### 🔧 Custom Agent Builder
- **System prompt editor** — define the core behavior and personality (advanced, optional)
- **Custom instructions** — add rules, tone guidelines, or constraints
- **Capabilities & pricing** — define skills and auto-calculated pricing
- **Live marketplace preview** — see how your agent will appear in the catalog as you build
- Tools and knowledge configured during the deploy step (same flow as prebuilt agents)
- All settings stored in DB and used during deployment

### 🎓 Agent Onboarding (Post-Deployment Training)
Just like training a new human employee, onboard your AI after deployment:
- **Connect Tools** — Link email, CRM, calendar, and other integrations with configuration notes
- **Company Knowledge** — Upload documents, FAQs, and policies for the agent to reference
- **Tasks & Expectations** — Define key responsibilities, performance expectations, and escalation rules
- **Test Drive** — Live chat to test your agent before going live
- Progress tracking across all tabs; "Complete Onboarding & Go Live" to activate

### 🔒 Agent Privacy & Publishing
- **Private by default** — Custom agents are only visible to the creator in Deployments
- **🔒 Private / 🌐 Published badges** — Clear visibility on every deployment card
- **Publish Portfolio** — Structured publish form with:
  - Specialty description (what the agent excels at)
  - Tool integrations (which platforms it connects to)
  - Target audience tags (industry, business size)
  - Sample use cases (real examples of tasks handled)
- **Quality Gates** — Agents must pass all checks before publishing:
  - Minimum 7 days deployed and active
  - 80%+ performance score
  - Onboarding completed
  - Portfolio fully filled out (100+ char specialty, 2+ tools, 2+ use cases)
- **Server-side validation** — Quality gates enforced on the backend (can't be bypassed)
- **Sanitized snapshots** — Private data (system prompts, API keys, company knowledge) is never included in marketplace listings

### 🌐 Community Marketplace
- **Publish custom agents** for other users to discover and deploy
- **Quality-gated publishing** — only battle-tested, well-documented agents make it to the marketplace
- Community agents appear with portfolio info: specialty, tools, target audience, use cases
- Dedicated "Community" category filter tab
- Snapshot-based publishing — agent definition frozen at publish time, private data excluded
- Install tracking per community agent
- Auto-approve for MVP; admin review dashboard planned

### 🔌 Tool Integrations
- **Email Tool** — Send emails, draft messages, manage templates (SendGrid API, webhook, or simulation mode)
- **CRM Tool** — Search contacts, log interactions, create/update records (webhook or built-in simulation)
- **Calendar Tool** — Schedule meetings, check availability, list upcoming events (webhook or built-in simulation)
- **Integrations page** — Add, view, and remove tool connections from the sidebar
- Each tool supports 3 modes: real API (e.g., SendGrid), webhook (forward to your backend), or built-in simulation
- **Tool Executor** — Central dispatcher routes LLM function calls to the correct tool handler
- **Deployment tool bindings** — Link tool connections to specific deployments
- **Execution logging** — Every tool call is logged with input, output, status, and duration

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
- Individual deployment performance metrics with agent-specific names
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
- Sidebar navigation: Dashboard, Marketplace, Deployments, Performance, Custom Builder, Integrations

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
| Tool Framework| Custom (Email/CRM/Calendar handlers)|
| State Mgmt    | React Context + Server Components   |

---

## 📁 Project Structure

```
ai-assistant-market/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── api/
│   │   │   ├── auth/           # Login, signup, logout, session endpoints
│   │   │   ├── deployments/    # CRUD, chat, model recommendation, onboarding
│   │   │   ├── employees/      # Marketplace catalog (prebuilt + community)
│   │   │   ├── integrations/   # Tool connections CRUD
│   │   │   ├── marketplace/    # Community submission & publishing
│   │   │   ├── purchases/      # Purchase/hire flow
│   │   │   ├── performance/    # Performance metrics
│   │   │   └── usage/          # Usage summary & quota status
│   │   ├── custom-builder/     # Custom agent builder with prompt editor
│   │   ├── dashboard/          # User dashboard
│   │   ├── deploy/[id]/        # 3-stage deployment wizard + chat + onboarding
│   │   ├── deploy/publish/[id] # Agent portfolio & publish flow
│   │   ├── integrations/       # Tool connections management page
│   │   ├── marketplace/        # Employee catalog & detail pages
│   │   └── performance/        # Performance tracking
│   ├── components/             # Shared UI (Sidebar, Navbar, Providers)
│   ├── data/                   # Seed data & employee definitions
│   └── lib/
│       ├── agents/             # AI agent engine
│       │   ├── agent-prompts.ts         # All 10 agent prompt definitions
│       │   ├── agent-registry.ts        # Agent construction from DB
│       │   ├── azure-openai-provider.ts # Azure OpenAI with function calling
│       │   ├── base-agent.ts            # Agent executor with tool loop
│       │   ├── llm-provider.ts          # Provider factory & mock provider
│       │   ├── model-recommender.ts     # Complexity scoring & model selection
│       │   ├── model-registry.ts        # Model configurations & capabilities
│       │   ├── types.ts                 # Agent type definitions
│       │   └── usage-meter.ts           # Quota reservation & usage tracking
│       ├── tools/              # Tool integration framework
│       │   ├── types.ts                 # ToolHandler interface & schemas
│       │   ├── email-tool.ts            # Email (SendGrid/webhook/simulation)
│       │   ├── crm-tool.ts              # CRM (webhook/built-in simulation)
│       │   ├── calendar-tool.ts         # Calendar (webhook/built-in simulation)
│       │   └── tool-executor.ts         # Central tool dispatcher
│       ├── auth.ts             # JWT helpers
│       └── db.ts               # SQLite connection & migration runner
├── data/
│   └── migrations/             # SQL migration files (auto-applied on startup)
│       ├── 001_initial_schema.sql
│       ├── 002_agent_backend.sql
│       ├── 003_usage_metering.sql
│       └── 004_custom_agents_community_tools.sql
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
        → buildSystemPrompt() — data-driven prompt assembly with customer config
        → resolveModel() — reads deployment's assigned model
        → reserveQuota() — atomic token reservation
        → AzureOpenAIProvider.generate() — real LLM call (with tool schemas)
        ↺ Tool-calling loop (up to 5 rounds):
            → Parse tool_calls from LLM response
            → ToolExecutor.executeTool() — dispatch to email/CRM/calendar handler
            → Feed tool results back to LLM
            → LLM generates final response
        → reconcileUsage() — log actual tokens, release reservation
    → Response with metrics
```

### Agent Prompt Architecture
```
buildFullSystemPrompt(agentType, deploymentConfig)
    → Base system prompt (unique per agent type)
    → Deployment context (name, schedule)
    → Tool instructions (only for tools the customer enabled)
    → Data source instructions (only for connected data sources)
    → Custom instructions (user-provided overrides)
    → Knowledge base (injected by BaseAgent from DB)
```

### Tool Integration Architecture
```
User configures tool connections (Integrations page)
    → Stored in user_tool_connections table
    → Linked to deployments via deployment_tool_bindings
    → Tools exposed to LLM as OpenAI function schemas
    → Tool calls executed by handlers (real API, webhook, or simulation)
    → Results logged in tool_execution_logs
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
Migrations are auto-applied on server startup via `src/lib/db.ts`. Each migration file in `data/migrations/` is tracked and only runs once. Currently 4 migrations covering: initial schema, agent backend, usage metering, and custom agents/community/tools.

---

## 📋 API Endpoints

| Method | Path                                    | Description                              |
|--------|-----------------------------------------|------------------------------------------|
| POST   | `/api/auth/login`                       | User login                               |
| POST   | `/api/auth/signup`                      | User registration                        |
| POST   | `/api/auth/logout`                      | User logout                              |
| GET    | `/api/auth/session`                     | Current session info                     |
| GET    | `/api/employees`                        | List marketplace employees (prebuilt + community) |
| POST   | `/api/employees`                        | Create custom employee (with prompt, tools, knowledge) |
| GET    | `/api/employees/[id]`                   | Employee details                         |
| POST   | `/api/purchases`                        | Purchase/hire an employee                |
| GET    | `/api/deployments`                      | List user's deployments                  |
| POST   | `/api/deployments`                      | Create deployment (with model rec)       |
| PATCH  | `/api/deployments/[id]`                 | Update deployment status                 |
| POST   | `/api/deployments/[id]/chat`            | Chat with deployed agent (with tools)    |
| GET    | `/api/deployments/[id]/conversations`   | List conversations                       |
| GET    | `/api/deployments/[id]/tasks`           | List task logs                           |
| POST   | `/api/deployments/recommend-model`      | Preview model recommendation             |
| GET    | `/api/integrations`                     | List tool connections & available tools   |
| POST   | `/api/integrations`                     | Add a tool connection                    |
| DELETE | `/api/integrations?id=...`              | Remove a tool connection                 |
| POST   | `/api/marketplace/submit`               | Publish agent with portfolio (quality-gated) |
| GET    | `/api/marketplace/submit`               | List user's submissions (optional ?employeeId filter) |
| GET    | `/api/deployments/[id]/onboarding`      | Get deployment onboarding data           |
| PUT    | `/api/deployments/[id]/onboarding`      | Update onboarding data (tools, knowledge, tasks) |
| GET    | `/api/usage`                            | Usage summary & quota status             |
| GET    | `/api/performance`                      | Performance metrics                      |

---

## 🗺️ Roadmap

- [x] Pre-built marketplace with 10 AI employees
- [x] 3-stage deployment flow with model recommendation
- [x] Real-time AI chat with knowledge base injection
- [x] Data-driven agent prompt system for all 10 agent types
- [x] Custom agent builder (system prompt, tools, knowledge, instructions)
- [x] Community marketplace (publish & discover user-created agents)
- [x] Tool integrations (email, CRM, calendar) with function calling
- [x] Usage metering & quota system
- [x] Agent onboarding flow (connect tools, company knowledge, tasks, test drive)
- [x] Agent privacy (private by default, published badges, sanitized snapshots)
- [x] Publish portfolio with quality gates (specialty, tools, use cases, readiness score)
- [x] Employee naming convention (human names + job titles)
- [ ] Admin panel for agent submission review
- [ ] Bring Your Own Key (BYOK) for enterprise customers
- [ ] Additional LLM providers (Anthropic, Groq, AWS Bedrock)
- [ ] Usage analytics dashboard with charts
- [ ] Real Google Calendar & SendGrid API integrations
- [ ] Settings & profile page
- [ ] Mobile responsive polish
- [ ] Production deployment (Vercel / Azure)

---

## 📄 License

Private — All rights reserved.

---

## 🙏 Acknowledgments

Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service), and [SQLite](https://www.sqlite.org/).
