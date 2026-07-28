# Features Research

**Researched:** 2026-07-28

## Table Stakes (users expect these)

### Event Landing Page
- Clear event description, date, venue, beneficiary
- Live progress bar (amount raised vs goal)
- Key stats (participants, donors, % of goal)
- Clear CTAs for both participation tracks

### Registration Flow
- Tier selection with pricing and rewards
- Personal details form (name, email, phone, t-shirt size)
- GDPR consent checkbox (required)
- Communications opt-in (optional)
- Confirmation message on success

### Fundraising Pages
- Personal URL (slug-based)
- Customisable: name, photo, personal message, goal
- "Donate" CTA → Monobank jar redirect
- Social sharing (WhatsApp, LinkedIn, Facebook, X, Email, Copy link)
- Collective progress display

### Progress Dashboard
- Total raised (from jar)
- Goal and percentage
- Participant count
- Donor count (if available from jar API)

## Differentiators (competitive advantage)

### Transparent Fee Breakdown
- Visual bar showing cause vs logistics split per tier
- Builds trust — donors see exactly where money goes
- Differentiates from opaque charity platforms

### "Where It Goes" Narrative
- Named beneficiary (Hurkit) with link
- Specific cause description (demining → families return home)
- Emotional connection between running and impact

### Co-organiser Credibility Bar
- Logos/names of all co-organisers in header
- Embassy endorsement adds legitimacy

### Breadcrumb Integration
- Event page nested within European Resolve events section
- Builds on org's existing credibility and SEO

## Anti-Features (deliberately NOT building)

| Feature | Why Not |
|---------|---------|
| Platform payment processing | Monobank jar model — platform never touches money |
| Per-runner donation totals | Jar model provides only aggregate; would mislead |
| Leaderboard | Requires per-runner attribution not available |
| In-app notifications | No user accounts; email-only comms |
| Mobile app | Web-first, static site |
| Admin dashboard UI | Google Sheets is the admin interface for v1 |
| Multi-event support | Single event; can generalise later |
| Stripe/Mollie integration | Team chose Monobank jar; revisit if needed |

## Feature Complexity Assessment

| Feature | Complexity | Dependencies |
|---------|-----------|--------------|
| Event landing page (static) | Low | Design tokens, content |
| Tier selection UI | Low | CSS only, no backend |
| Registration form + API | Medium | Backend, Google Sheets, email |
| Live progress stats | Medium | Monobank jar API, caching, polling |
| Fundraiser page creation | Medium | Backend, slug generation, validation |
| Dynamic fundraiser pages | Medium | Client-side fetching, fallback shells |
| Donor wall (opt-in) | Medium | Backend endpoint, form on platform |
| Social sharing buttons | Low | Client-side only, share URLs |
| Breadcrumbs | Low | Static, part of layout |
| i18n structure | Low-Medium | Content extraction, locale routing |
| Confirmation email | Medium | Email service (SendGrid/Resend/SES) |
| UAH→EUR conversion | Low | ECB rate or Monobank currency endpoint |
