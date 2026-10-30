# JanSeva

A English-language officer workspace for local public grievances. Built for the Kenpath Full Stack AI Engineer assignment. All seeded people, villages and grievances are fictional. This is a working prototype, not an official government portal.

## Problem and users
Field and block-level staff need to collect scattered grievance details, record inspections and explain decisions. JanSeva brings this work into a small, readable workflow. English is used at the project owner's request. The assignment asks for a local-language interface; confirm whether English meets the intended users' needs before submission. The assignment does not specify a location. Confirm a district and validate the workflow with its officers before real use.

## Workflow
1. **Initial scrutiny:** confirm applicant details, issue/location clarity and jurisdiction. All three checks must pass before advancing.
2. **Field verification:** record observed facts and uncertainties. An inspection note is required before advancing.
3. **Final decision:** approve disposal or reject with a reason. Return for corrections from any active stage. Returned applications can be reopened after corrections; checks must be completed again.

An officer registers applications, searches/filters the queue, prioritises urgent and overdue work, and views a timestamped history. The seven-day target is an illustrative internal target, not a statutory deadline. No citizen portal, appeal flow, document upload or government system integration is implemented.

### Process research and limits
Official references consulted on 29 October 2026:
- https://www.pgportal.gov.in/Home/Faq
- https://www.pgportal.gov.in/Home/ProcessFlow
- https://www.pgportal.gov.in/ (includes citizen feedback and appeals after disposal)

These inform receipt, officer handling and reasoned disposal. The three-stage workflow is a deliberately simplified local grievance prototype, not a claim that CPGRAMS requires these exact stages. Citizen feedback/appeals and routing between departments remain future work. Validate with local staff before claiming process fidelity. No field interviews have been conducted.

## AI assistance
- Scrutiny: summarise the issue and flag missing details.
- Verification: suggest a field checklist; help identify evidence to collect.
- Decision: draft a neutral note using the saved field report.

Set OPENAI_API_KEY for live model assistance. Without it, a plainly labelled rule-based offline helper keeps the demo usable; it is **not live AI**. AI cannot mutate status, tick checks or decide. Model calls exclude applicant name/ID, but free text can still contain personal information; only enter fictional data. The system prompt treats record text as untrusted input, limits answers to supplied facts and asks for uncertainty. Human review remains necessary. Do not claim AI quality has been evaluated yet.

## Run locally
Requires Node.js 20+; no dependencies or database installation.

```powershell
npm start
```

Open http://localhost:3000

Demo login: **officer@janseva.demo** / **Demo@2026**

Optional environment configuration (PowerShell, same terminal before npm start):

```powershell
$env:OPENAI_API_KEY = 'your-key'
$env:OPENAI_MODEL = 'gpt-4.1-mini'
$env:DEMO_PASSWORD = 'choose-a-strong-password'
$env:PORT = '3000'
npm start
```

Secrets must be configured as environment variables; .env files are not automatically loaded. Do not commit keys. Run tests with `npm test`.

## Technical decisions
- Dependency-free Node HTTP API and vanilla JavaScript: small codebase, fast startup and no external build toolchain.
- English UI with responsive layout, keyboard focus handling, accessible form labels, text status indicators and large controls.
- Server-enforced transitions, reason validation and optimistic concurrency versions prevent skipped stages and stale writes.
- Durable JSON storage in DATA_DIR (default ./data), atomic file replacement and a serial write queue. Suitable for one server process and this small demo; use a transactional database and role-based access for real deployment.
- HttpOnly, SameSite cookies, eight-hour sessions, login throttling, password hashing, HTML escaping, restrictive CSP and same-origin mutation checks. Single demo officer, not production identity management. Sessions are memory-only and expire on restart. Audit records are append-only through the API, but not tamper-proof against filesystem administrators.
- Live AI uses server-side API credentials, timeout and explicit failure messages. No secret reaches the browser.

## Impact and evaluation
Establish a baseline from anonymised manual records, then pilot with 3–5 officers using fictional cases before any real data. Track median handling minutes per stage, total resolution time, overdue percentage, return/reopen rate and missing-information errors. Compare matched case types before/after, accounting for workload differences. Review AI suggestions for factual support, invented claims and English readability; measure acceptance/edit rates and whether they save officer time. Collect task-completion and usability feedback. Suggested targets (hypotheses, not measured results): 25% less handling time, fewer repeat returns, no final decisions without reasons.

## Deployment and submission
Deploy one Node process with `npm start` on a Node host that supports a persistent volume. Set NODE_ENV=production, DEMO_PASSWORD, optional OPENAI_API_KEY and DATA_DIR pointing to the mounted volume. HTTPS is required for secure production cookies; a typical reverse proxy must preserve Host and provide the same public origin. Ephemeral/serverless disks will lose records. Do not scale this JSON backend to multiple instances. Health endpoint: /api/health.

Before submitting: deploy and verify live AI, create an accessible GitHub repository, update this README with the live URL, and email the repository, URL and test credentials by **2 November 2026**. Source repository: https://github.com/ShailenderYadav/Govt-Project. Live deployment is still pending.
