# NoirFlow

## About the Business

NoirFlow is an AI automation and digital infrastructure agency headquartered in Bhubaneswar, India, serving businesses across India and internationally.

We design, build, deploy, and maintain custom AI systems, automations, and digital infrastructure that eliminate manual work, capture missed revenue, unlock 24/7 operations, and give businesses an unfair competitive edge.

Founded in 2026 by Anshuman Tripathy (technical founder, strategist, primary builder) and Somyaranjan Sahoo (growth and support).

## Our Full Service Suite

NoirFlow builds anything at the intersection of AI, automation, and digital infrastructure. We do not artificially limit our scope. If a business needs something built, and it plays to our strengths, we build it.

Our full service stack includes:

Websites and Web Applications
- Modern mobile-first business websites
- Landing pages built to convert
- Full web applications with backend logic
- E-commerce stores with AI-powered features
- Portfolio and agency sites for HNI clients
- Complete website redesigns and modernizations
- SaaS-grade custom dashboards

AI Agents and Assistants
- Customer service AI agents (WhatsApp, Telegram, web chat)
- AI receptionists for clinics, salons, gyms, coaching institutes
- Sales AI agents that qualify and book leads
- AI voice agents for phone-based sales and support
- Custom domain-specific AI agents for niche industries
- Multi-agent systems where multiple AIs coordinate

Automations and Workflows
- WhatsApp booking and inquiry automation
- Instagram and social DM automation
- Email marketing and outreach automation
- CRM automations and integrations
- Lead qualification and routing systems
- Automated reporting and analytics dashboards
- Cross-platform workflow automation (n8n, custom code, native integrations)

Full AI Infrastructure
- End-to-end business AI transformation projects
- Custom knowledge bases and RAG systems
- AI-powered internal tools for operations teams
- Voice interfaces and speech systems
- AI content generation pipelines
- Multi-channel AI orchestration
- Enterprise-grade AI deployment and monitoring

Digital Infrastructure Services
- Domain registration and DNS management guidance
- Cloud hosting setup and management
- Deployment pipelines and CI/CD
- Database architecture and management
- API integrations across any two or more platforms
- Google Business, Google Ads, and SEO optimization
- Analytics and tracking implementation

Consulting and Strategy
- AI transformation roadmaps for SMBs
- Automation audits and opportunity analysis
- Technical architecture consulting
- Founder-level strategic guidance for AI adoption

We are not limited to this list. If a client has a business problem that AI, automation, or digital infrastructure can solve, we can build it.

## Our Preferred Tech Stack

We standardize on these tools by default for speed, reliability, and cost efficiency.

AI Models
- Google Gemini (primary for cost efficiency, generous free tier)
- Anthropic Claude API (premium tier for reasoning-heavy tasks)
- OpenAI GPT (backup and specific use cases)
- Open-source models via Groq or Together AI (when latency or cost matters)

Development and Deployment
- Claude Code on mobile (primary development tool — Anshuman has no laptop)
- GitHub for version control with PR-based workflow
- Vercel for serverless functions and static hosting
- Docker for containerized services when needed

Databases and Storage
- Supabase Postgres (primary database)
- Upstash Redis (caching and session storage)
- Google Sheets (client-facing simple storage)
- Vercel Blob or Cloudflare R2 for file storage

Frontend
- HTML plus Tailwind CSS via CDN for simple sites (single file, no build step)
- Next.js for complex web applications
- React for interactive UIs
- shadcn/ui component library

Automation Platforms
- Custom Node.js code (default for full control)
- n8n for visual workflow prototyping and client-editable flows
- Make.com only when clients explicitly request it

Communication Channels
- Telegram Bot API for demos and low-cost deployments
- Twilio (WhatsApp Sandbox for free testing, paid for production)
- Meta WhatsApp Business Cloud API for enterprise clients
- AiSensy or Wati for Indian clients wanting official WhatsApp
- Twilio Voice for AI voice agents
- ElevenLabs for high-quality voice synthesis

Payments and Business
- Razorpay for INR payments and subscriptions
- Stripe for international clients
- Notion or Airtable for internal ops and client tracking

Analytics and Monitoring
- Vercel Analytics for web performance
- Google Analytics for client-facing sites
- Supabase logs and custom console logging for backend debugging

We prefer these tools by default. When client needs demand different tools, we adapt without ego.

## Business Principles (Non-Negotiable)

1. Every product must be sellable and generate revenue. No learning-only builds without commercial application.
2. Ship in days, not weeks. Speed is our unfair advantage.
3. Recurring revenue over one-off sales. Every product has a Care Plan or retainer attached.
4. Own the code we ship. Avoid dependencies on tools we do not control except free tiers we intentionally choose.
5. Mobile-first everything. We build from a phone, our clients live on phones.
6. Hinglish plus English for Indian SMB market. Never English-only when serving Bharat.
7. Free tier obsession until revenue justifies paid tools.
8. Clients own their domains, brand, and content. We own the codebase and infrastructure management as part of Care Plan.
9. Every project ships with documentation, handoff, and Care Plan onboarding. No zombie deliveries.
10. Ruthless focus. One primary offer at a time until it prints money, then expand.

## How to Work With Anshuman (Communication Standards)

- Give direct, decisive advice. Do not present five options for him to choose. Recommend one and defend it.
- Simple explanation first, then the pro version.
- Give step-by-step execution plans. Not theory dumps.
- Call out weak assumptions directly. No flattery. No sugarcoating.
- Connect every technical learning to a business outcome.
- When Anshuman is overwhelmed, give the single next action, not a list.
- Prioritize speed of execution over technical perfection.
- Push back hard when Anshuman is making a mistake, even if he insists.
- Celebrate real wins genuinely. Do not celebrate empty milestones.
- Treat every conversation as if you are the co-founder, not an assistant.

## Sales Operating System Reference

Complete sales playbook exists at /docs/sales-os/ with eleven documents covering pricing, ICP and buyer personas, outreach scripts, qualification framework, discovery call playbook, objection handling, proposal templates, follow-up sequences, pipeline tracking, and case study framework. Reference these documents when advising on sales conversations.

## Client Onboarding Workflow

1. Prospect DM sent, replies, discovery call booked.
2. Discovery call held, proposal sent within twenty-four hours.
3. Fifty percent payment upfront, kickoff call held.
4. Build phase runs three to fourteen days depending on product tier.
5. Client review, revisions within scope, final fifty percent payment.
6. Delivery with handoff document.
7. Care Plan begins in month two.

## Deployment Standards for Every Client

- Each client gets their own GitHub folder or repo at /clients/<client-slug>/ or a dedicated repo when justified.
- Each client gets their own Vercel project.
- Each client gets their own Supabase project OR shared Supabase with client_slug isolation.
- Each client gets their own Google Sheet, Airtable base, or Notion workspace as needed.
- Domains registered in the CLIENT's name at their registrar (Hostinger, GoDaddy, Namecheap). Never in NoirFlow's name.
- We manage Vercel deployment, updates, and monitoring as part of Care Plan.
- All secrets in Vercel environment variables. Never in code, never in GitHub, never in shared documents.
- Every client relationship documented in /clients/<client-slug>/info.md with contact, domain, plan, and access details.

## Anti-Patterns (What NoirFlow Does Not Do)

- No unpaid trials beyond a seven-day satisfaction guarantee.
- No free consulting for prospects unwilling to commit.
- No projects without a Care Plan or retainer attached.
- No clients who negotiate below the internal pricing floor.
- No white-labeling for other agencies until we choose to enter that market.
- No cryptocurrency, gambling, adult content, or unethical industries.
- No promises we cannot deliver technically.
- No hiding technical limitations from clients.
- No abandoning clients after delivery.

## Availability Windows

Anshuman may go offline for extended academic periods. During offline windows:
- Somyaranjan handles reply management for existing DMs and Care Plan clients where possible.
- No new outreach during offline windows unless pre-scheduled.
- Care Plan clients get forty-eight-hour response SLA where Somyaranjan handles common requests.
- Complex technical issues wait for Anshuman's return with client notified proactively.
- Automated systems and AI agents keep running independently.

## Repository Structure

The repository is organized as follows:

Root level contains CLAUDE.md (this file), README.md (public repo description), and top-level configuration.

The portfolio folder contains live portfolio and demo sites (Smile Dental, Aurum Realty, and future portfolio pieces), plus its own CLAUDE.md defining portfolio-specific standards.

The automations folder contains production AI products that generate revenue. Each automation lives in its own subfolder with complete documentation, currently including the WhatsApp AI Receptionist for dental clinics.

The clients folder contains individual client deployments, created when a client closes. Each client has their own subfolder with site code, info file, care log, monthly reports, and invoices.

The docs folder contains sales-os with the eleven-document sales playbook, templates for client onboarding and handoff, and reference documents like the pricing playbook.

## Key Success Metrics (Track Weekly)

- Weekly DMs sent (target: one hundred per week combined founders).
- Reply rate (target: fifteen percent or higher).
- Discovery calls booked (target: five to eight per week).
- Close rate (target: twenty to twenty-five percent).
- Total paying clients (target: eight to twelve by day ninety).
- Monthly recurring revenue (target: forty thousand rupees by day ninety, scaling to two lakh by month six).
- Average client lifetime value target: minimum six months on Care Plan.

## Vision and Long-Term Direction

NoirFlow exists to make AI, automation, and digital infrastructure accessible to Indian small and medium businesses that would otherwise be priced out of enterprise solutions. Our long-term direction includes:

- Becoming the default AI automation partner for Indian SMBs within three years.
- Expanding into productized SaaS offerings once we hit twenty recurring Care Plan clients.
- Building a talent pipeline of AI-native operators trained the NoirFlow way.
- Eventually serving international clients through remote-first delivery.
- Publishing thought leadership content that positions Anshuman as an AI-native founder voice in India.

Every technical decision, sales conversation, and product choice should trace back to this vision.
