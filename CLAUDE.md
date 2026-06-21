# CLAUDE.md — NoirFlow Automation Lab

## About Me
- Name: Anshuman
- Business: NoirFlow — AI automation & digital infrastructure agency
- Goal: Build automations I can sell as productized services or custom builds to clients
- Skill level: Beginner to early-intermediate. Strong with AI tools, prompting, no-code. Still learning code, agents, and systems.

## Mission of This Repo
Every automation built here must be:
1. **Sellable** — solves a real, painful business problem someone will pay for
2. **Reusable** — modular enough to resell to multiple clients with minor tweaks
3. **Deliverable** — comes with setup docs, env template, and a client-facing README
4. **Demoable** — I can show it working in under 2 minutes on a sales call

## Tech Stack (default choices unless I say otherwise)
- **Language:** Node.js (JavaScript/TypeScript) and Python
- **Automation platform:** n8n (self-hosted or cloud) — prefer n8n workflows when possible
- **AI APIs:** Anthropic Claude (primary), OpenAI (secondary)
- **Agent frameworks:** Claude Agent SDK, LangChain only when justified
- **Database:** Supabase (Postgres) by default
- **Hosting:** Vercel for web, Railway/Render for backend, n8n Cloud for workflows
- **Frontend (when needed):** Next.js + Tailwind + shadcn/ui
- **Auth:** Clerk or Supabase Auth
- **Payments:** Stripe

## How I Want You to Work With Me

### Teaching mode (default ON)
- Explain the **simple version first**, then the **pro version**
- Give **step-by-step execution plans**, not walls of theory
- Show me the **why** behind architectural choices in 1-2 sentences
- Call out **weak assumptions or mistakes** directly — do not flatter
- When I seem overwhelmed, give me the **single next action**, not 5 options

### Code style
- Clean, commented, production-ready — assume a client will read it
- Small functions, clear names, no clever one-liners
- Always include error handling and logging
- Always include a `.env.example` when secrets are involved
- Never hardcode API keys, URLs, or client-specific data

### Project structure (default for every automation)
```
/automation-name
  README.md              # Client-facing: what it does, setup, pricing notes
  CLAUDE.md              # Optional per-project context overrides
  .env.example           # Template for required secrets
  /src                   # Code
  /workflows             # n8n JSON exports
  /docs                  # Setup guide, demo script, loom links
  /prompts               # System prompts for any LLM calls
```

### Deliverables checklist (every automation must ship with)
- [ ] Working code or n8n workflow
- [ ] `.env.example` with every required variable documented
- [ ] README with: what it does, who it's for, setup steps, demo instructions
- [ ] One-paragraph sales description I can paste into a DM or proposal
- [ ] Suggested pricing tier (one-time / monthly / setup + retainer)
- [ ] List of upsells or add-ons

## Business Lens (apply to every build)
For every automation, briefly answer:
1. **Who buys this?** (industry, role, company size)
2. **What pain does it kill?** (time saved, money made, errors avoided)
3. **How do I price it?** (suggested range with reasoning)
4. **How do I demo it in 90 seconds?**
5. **What's the cheapest viable v1?** (ship fast, iterate later)

## Things to Avoid
- Over-engineering. v1 ships in days, not weeks.
- Theoretical explanations without a runnable example
- Suggesting tools I have to pay for without flagging the cost
- Building features I didn't ask for
- Skipping the business/sales context — every build has a buyer

## When in Doubt
- Ask me **one** clarifying question, not five
- Default to the choice that makes the automation easier to **sell and resell**
- Bias toward **shipping** over polishing

## Current Focus Areas
- AI Automation
- n8n workflows
- Claude Code & Claude Agent SDK
- AI agents (sales, support, ops)
- Client acquisition systems
- Productized service packaging
