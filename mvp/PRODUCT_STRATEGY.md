# Veto: Product Strategy

> Companion to [MVP_SCOPE.md](MVP_SCOPE.md) and [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md). Status: draft waiting for review.
>
> This document covers what comes after the MVP, and the assumptions the MVP has to test. Nothing here is part of the semester scope unless MVP_SCOPE.md says so.

## 1. Purpose

The MVP proves that Veto can take someone from "I don't know who has my data" to "I have sent requests and I know when companies must reply". This document records what we believe about users, how Veto could make money, which platforms come next, and how the product could grow, so that decisions made this semester do not close those doors by accident.

## 2. Personas: hypotheses to validate

Everything below is a **hypothesis**. None of it has been confirmed with real users yet. The Phase 1 interviews (three per group, nine in total) exist to confirm, correct, or reject these statements. Each group lists the questions the interviews must answer.

### University students (18 to 25)

**Hypotheses**
- They have accumulated years of impulsive sign-ups for discounts, food apps, streaming trials, and social platforms.
- They want a cleaner digital footprint before entering the job market, and less marketing email.
- They mostly use their phone, and trust recommendations from friends.
- They give up on an app that does not show a useful result within about five minutes.
- They are not willing to pay.

**What the interviews must answer**
- How many services do they think they are registered with, and how many can they name?
- Have they ever tried to delete an account or ask a company for their data? What stopped them?
- What would make them open Veto a second time?
- Would they pay anything, and for what?

### Privacy-conscious adults (21 to 45)

**Hypotheses**
- They know their GDPR rights, use privacy tools, and read privacy policies.
- What they lack is time to exercise those rights one company at a time.
- They check where data goes, whether the code is auditable, and who is behind a tool before installing it.
- They would pay for a premium version, but only if it is as private as it claims.
- They handle personal privacy outside working hours, and avoid connecting personal accounts on work laptops.

**What the interviews must answer**
- Which tools do they already use, and what do they trust about them?
- What would they need to see before connecting their Gmail to Veto?
- Is phone or computer where they would do this? At what time of day?
- What would a paid version have to offer to be worth it?

### Adults with forgotten accounts (25 to 60)

**Hypotheses**
- They no longer remember most of the accounts they created over the years.
- They only act after a trigger: a breach notification, a news story, or a life event such as changing jobs, a divorce, or handling a deceased relative's accounts.
- They choose based on perceived trust: a known brand, a recommendation, a newspaper article.
- They need a simpler experience than the other two groups.

**What the interviews must answer**
- What happened the last time they worried about their data? What did they do?
- Do they use Gmail, or another provider? (This affects how many of them the MVP can reach.)
- Who would they trust to recommend a tool like this?
- Which steps of the flow do they find confusing?

## 3. Future audience: companies

The MVP is entirely business-to-consumer. Once the product is proven with individual users, three business-to-business openings are worth revisiting:

- **Employee privacy programmes.** Banks, insurers, law firms, and hospitals face risk when employees are personally exposed to phishing and identity theft. Veto could be sold as an annual per-employee licence, like password managers and identity monitoring services already are.
- **Partnerships with consumer and educational organisations.** Deco Proteste, the CNPD, universities, and privacy NGOs offer distribution and credibility; Veto offers them a practical tool.
- **Data breach remediation.** Companies required to notify users after a breach could offer Veto as a visible remediation measure, priced per incident.

Not a good market: data protection officers (Veto sends them work) and small businesses (little budget, little need).

## 4. Platform strategy

### Why mobile first

The MVP is a mobile app because we believe (hypothesis, to be checked in interviews) that people handle their personal inbox and personal privacy on their own phone, outside working hours, and prefer not to connect personal accounts on work computers. A mobile app also offers the operating system's own isolation between apps, and secure storage for tokens and keys.

### Why not a Gmail add-on or browser extension

- **Permissions.** An extension that reads Gmail in the browser usually needs permissions such as "read and change all your data on the websites you visit", which is an immediate red flag for privacy-conscious users.
- **Shared environment.** Extensions run next to other extensions that may read the same page.
- **Fragility.** An extension that adds buttons to the Gmail web interface breaks when Google changes its layout.
- **Reach.** A Gmail add-on runs inside Google's restricted environment, and browser extensions leave out iPhone users entirely.

### A desktop app after the MVP

If interviews and testers show demand on the computer (most likely from privacy-conscious adults), the next platform is a native desktop app that calls the Gmail API directly, with tokens in the macOS Keychain or the Windows Credential Manager.

This does not come for free from the mobile code. Flutter supports macOS and Windows as official targets, although each platform still needs its own integration and testing. For React Native, macOS and Windows are maintained outside the core project, which means more integration and testing work. **The framework is chosen for the needs of the mobile MVP** (decision D6 in MVP_SCOPE.md), and desktop effort is estimated separately when it is planned.

## 5. The Personal Data Map

The MVP produces an exposure map from email. Once that works, the same local database can combine more sources into a **Personal Data Map**, still analysed on the device:

- **Email detection**, the MVP feature.
- **Email export files** (`.mbox`, `.eml`), for users of any provider, and for anyone who prefers not to use OAuth.
- **Breach checks** against public breach records (for example Have I Been Pwned), to flag accounts known to be exposed. This needs care: checking an email address against an external service sends that address to it, so it must be opt-in and explained.
- **Subscriptions and renewals**, to show the recurring cost of each service.
- **Request history** over time, per company and per right.
- **Password manager imports** (CSV), to find accounts that never left an email trace.
- **Encrypted export and import** of the whole map, so users can move to a new phone.

None of these add dependencies to the MVP, and each must pass the architectural rule in [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md#7-architectural-rule) before being built.

## 6. Monetisation

Nothing here is built this semester. The goal is to agree now on what stays free, what could be paid, and what a paid feature actually delivers.

### Plans at a glance

| Feature | Free (0 €) | Pass (7.99 € for 30 days) | Plus (3.99 €/month or 29.99 €/year) |
|---|---|---|---|
| Goal | Try the product and handle occasional requests | A concentrated clean-up | Keep the footprint up to date |
| Mailboxes | 1 Gmail account | Up to 2 | Up to 2 |
| Connection | Per scan | Per scan | Per scan, or continuous if the user opts in separately |
| Scans | 1 user-started scan per month | Unlimited manual scans for 30 days | Unlimited manual scans; with continuous access, **periodic checks when the operating system allows, and every time the user opens the app** |
| Companies detected, added, requests created | No limit | No limit | No limit |
| Sending requests | From the user's own email | Same | Same |
| Recording "sent" | Indicated by the user | Indicated by the user | Indicated by the user; with continuous access, the app can suggest a send it found, for confirmation |
| Recording a reply | Indicated by the user, with a note | Can also import one reply for help understanding it | Can import a reply, or get a "possible reply found" suggestion with continuous access |
| Reply assistance | Not included | Summary and suggested next step for chosen replies, for 30 days | Same, while Plus is active |
| Reminders | In the app | In the app, during the Pass | In the app, ongoing |
| End of plan | Not applicable | Back to Free limits; history kept | Back to Free limits; periodic checks and paid suggestions stop |

**Why "periodic checks when the system allows", not "a weekly scan".** A local-only app cannot promise background work at an exact time. On iOS in particular, the system decides when background refresh runs, based on battery, usage, and other factors. The honest promise is a check when the system allows, and always when the user opens the app.

### What each plan feels like

**Free: "I want to discover and send one request."** The user connects Gmail for a scan, sees the results by category with their evidence, confirms a company, prepares a request, and sends it from their email. Back in Veto, they confirm it was sent and see the deadline. Free must solve a complete problem: if it only showed company names and charged to act, it would be hard to trust a product about rights and privacy.

**Pass: "I want to sort out my digital footprint this month."** Thirty days, no recurring charge. A second mailbox, unlimited manual scans, and help with replies: the user picks a specific reply to import, rather than giving Veto access to all messages, and Veto summarises it, points out unanswered questions, and suggests a follow-up draft. When the Pass ends, history and notes stay; new assisted analyses need another Pass or Plus.

**Plus: "I want this kept up to date."** Plus does not change who sends requests. It adds the option of continuous access, with periodic checks that can suggest "possible new company" or "possible reply found". Every suggestion needs the user's confirmation, and nothing becomes "closed" automatically. Someone can pay for Plus and refuse continuous access; they keep unlimited manual scans and reply assistance. The pricing page must say this clearly.

### Paying without a Veto account

Veto has no accounts, so purchases have to be linked to the app store account instead:

- On iOS, paid digital features inside the app must use Apple's in-app purchases, and eligible purchases must be restorable. On Android, Google Play Billing plays the same role.
- The app keeps the user's entitlement locally and offers **"Restore purchases"**, which asks the store for the receipts after a reinstall or on a new phone. No Veto account is needed, but this has to be designed and built, and tested on both platforms.
- The Free plan's monthly scan limit is enforced on the phone and could be bypassed by reinstalling. This is accepted: free limits are not a security boundary.

### Design rules for all plans

- **States with a clear origin.** `sent (indicated by user)`, `possible send found`, `reply received (indicated by user)`, `possible reply found`. Inference is never shown as fact.
- **Cancelling and disconnecting are separate.** Cancelling a plan ends paid features. Disconnecting a mailbox ends scans and revokes access. Stored requests and notes are only deleted if the user asks.
- **No promises about external outcomes.** Veto measures detections reviewed, requests prepared, and replies recorded. It cannot promise that companies reply, that erasure happens, or that classification is always right.
- **Reply assistance must respect the privacy promise.** If summarising replies needs an AI model, it runs on the device; otherwise the architectural rule in SECURITY_AND_PRIVACY.md applies before it is built.
- **The most important decision.** Plus is not launched until continuous access, disconnection, and suggestions are properly built. Until then, a useful Free plan plus the 30-day Pass is the clearer offer.

## 7. Monetisation risks and how we address them

| Risk | What we do about it |
|---|---|
| **Plus needs continuous access**, which conflicts with the per-scan connection. | Launch Plus in two steps: first unlimited manual scans, second mailbox, and reply assistance, with no continuous access; continuous checks added later as an explicit opt-in that can be switched off in one tap. |
| **Suggestions can be wrong.** A sent message does not prove delivery; a reply does not prove compliance. | Every suggestion shows its evidence and needs confirmation. The value is framed as "Veto spots it for you", not "Veto confirms it". |
| **Low retention after the Pass.** | History always stays; the free monthly scan brings users back with new results; a Pass bought in the last 30 days can be credited towards a Plus year. |
| **Store rules and fees.** | Pricing is set after checking Apple and Google fees and rules; purchases and restores are tested before launch. |
| **Paid features increase the processing profile.** | Each paid feature goes through the architectural rule and an update of the DPIA before release. |

## 8. Post-MVP decisions

| # | Decision | Options | Proposal |
|---|---|---|---|
| S1 | Next platform after mobile | Browser extension. Native desktop app. | Native desktop app, if interviews show demand. Effort estimated separately for the chosen framework. |
| S2 | Monetisation shape | Free only. Free plus Pass. Free plus Pass plus Plus. | Free plus Pass first; Plus only once continuous access is properly built. |
| S3 | Second email source | Email file import. Outlook (Microsoft Graph). Generic IMAP. | Email file import first (no Google verification needed, works for any provider), then Outlook. |
| S4 | Moving to a new phone | None. Encrypted export file. Cloud sync. | Encrypted export file controlled by the user. No cloud sync. |
| S5 | When to approach business customers | During Year 2. After consumer validation. | After the consumer product is validated with real users. |
