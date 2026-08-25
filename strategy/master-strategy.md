# ProductionX — Master Marketing Strategy

The authoritative document. Everything else in this folder is the detailed
execution layer underneath it — this file explains the architecture and
points to where each part is actually built out.

**Goals, as set: leads, awareness, trust, business.** Those aren't four
separate initiatives — they're four stages of one system, in order. This
document builds that system.

---

## 0. Where things actually stand

Full detail in the linked files — this is the compressed version so the
strategy below is read against reality, not hope.

- **Cash:** near-zero, family floor ₹1L/mo, business costs ₹50k/mo. Designerz
  Hub is cold. OTHO postponed a month (budget, not rejection). Mahati's ₹25k
  is confirmed but delayed to Sept's second week. → `10-day-cash-plan.md`
- **Online presence:** real, not blank — Instagram and Facebook have genuine
  content, just thin reach. LinkedIn is dormant. Google Business Profile has
  288 recorded interactions and no phone number listed. → `online-presence-audit.md`
- **Founder record, corrected:** vendor → Content Producer at Silver Star
  Hyderabad (Mercedes-Benz dealership) → Head of Creative & Marketing at
  Ujwala Group (1UJ) → founded ProductionX. Confirmed studio clients: Tanishq,
  BMW, IRDAI, Silver Star, and six more named accounts. → `content-topic-bank.md`
- **The plan runs on ~2.5 hrs/day of content time**, alongside revenue work,
  because there's no budget to hire it out. → `daily-operating-schedule.md`

Nothing below pretends this constraint away. The strategy is built to work
inside it, and to loosen it over time.

---

## 1. Positioning — what ProductionX actually is, sharpened

Using Dunford's method: define against real alternatives, not competitors in
the abstract.

**What a buyer would do instead of hiring ProductionX:**
1. Hire three separate vendors (a strategist, a production house, a web dev) and coordinate between them
2. Hire a freelancer and get one discipline, cheaply, inconsistently
3. Hire a large agency and get process, slowly, at a price this market mostly can't pay
4. Do nothing and keep posting ad hoc

**What ProductionX has that the alternatives don't:**
- One team across all three disciplines, so nothing gets lost in translation between vendors
- A founder who has sat on *both* sides of the hiring table, twice — this is rare and it's real, not marketing language
- AI-leveraged production (previz, generated content) that lets a small studio deliver at a speed and price a traditional crew-only shop can't match
- A named specialism forming around real estate — previz, launch microsites, the Sattva Amora precedent

**Who this matters most to:** developers and premium local brands
(automotive, hospitality, fashion) who need marketing to *perform*, not just
look good, and who don't have the budget or patience to manage three vendors.

**The one-line positioning:** *ProductionX is the one studio that thinks,
shoots and builds — for brands that would otherwise need three vendors to do
what one team here does in six weeks.*

---

## 2. The framework — RACE

Four stages, each with its own job, its own content, and its own metric.
Nothing gets built without knowing which stage it's serving.

```
REACH ──────► ACT ──────► CONVERT ──────► ENGAGE
awareness     trust        leads           business
"found us"   "believes    "talked to      "paid, stayed,
              us"          us"             referred"
```

### REACH — awareness, the top of the funnel

**Job:** be findable by someone who doesn't know ProductionX exists yet.

Per Byron Sharp: consistency and physical availability beat cleverness here.
Being easy to find in the ten seconds someone searches "video production
Hyderabad" matters more than one brilliant viral post.

| Channel | What | Owner doc |
| --- | --- | --- |
| Google Business Profile | Local pack visibility, the single fastest channel | `online-presence-audit.md` — phone number fix is priority zero |
| Instagram Reels | Reach beyond followers via the algorithm | `content-plan-100-days.md`, `content-topic-bank.md` |
| LinkedIn | Reaches the actual buyer directly — currently the weakest channel despite being highest-value | same |
| Spec teardowns | Zero-permission, zero-cost content that already produced one real lead | `content-topic-bank.md` Pillar 3/5 |
| AI-SEO / llms.txt | Being the quotable answer when someone asks an AI assistant | `online-presence-audit.md` — the Vizag correction sits here too |

**Metric:** GBP views/interactions, Instagram reach, LinkedIn impressions —
all currently near-zero on LinkedIn, real but small elsewhere. Target: visible
month-over-month growth, not a specific number yet — there's no baseline
trend established.

### ACT — trust, the middle of the funnel

**Job:** turn "I found this studio" into "I believe this studio can do the
work." Per Schwartz's awareness stages, this is where a *problem-aware* or
*solution-aware* buyer becomes *product-aware* — they know ProductionX
specifically, not just that studios exist.

| Channel | What | Owner doc |
| --- | --- | --- |
| Case studies | Mahati/Aruna sites, Sattva Amora, named client work | `content-topic-bank.md` Pillar 2 |
| Process content | The five-step process, already on the site, turned into posts | Pillar 4 |
| FAQ / "They Ask You Answer" | Already structurally built (`app/lib/faq.ts`) — extend it to cover every real objection a buyer has, in their language | site + blog |
| Founder-as-evidence content | *Why ProductionX works this way* — institutional, not personal | Pillar 1 |
| Reviews | GBP review requests after every delivery | `online-presence-audit.md` |

**This is the stage most competitors skip**, and it's the one Gemini's own
answer flagged when asked "is ProductionX trustworthy" — its advice was
literally "ask for case studies." That's not a coincidence, it's confirmation
this stage is the real gap.

**Metric:** saves, shares, comments, DMs started, case-study page views.

### CONVERT — leads, the point of the funnel

**Job:** turn trust into an actual conversation, and a conversation into a
signed client.

This stage isn't primarily content — it's the sales mechanics already built:

- The Designerz Hub offer ladder — a real ₹80k rung where none existed before → `designerz-hub-80k-package.md`
- The OTHO split-the-decision tactic — sign the small thing, don't let it wait on the big thing → `otho-monday-close-plan.md`
- Every piece of content still needs the explicit ask — "DM 'AUDIT'" — the single most-skipped mechanic in the whole plan → `content-plan-100-days.md`

**Metric:** DMs/enquiries per week, proposals sent, close rate. Current
baseline: 1 close from 5 pitches. The offer-ladder fix targets this directly.

### ENGAGE — business, the outcome

**Job:** the paying client stays, refers, and becomes proof for the next one.
This is also where "business" as a goal actually gets measured — not content
metrics, revenue.

- Retainer structure with a minimum term (already standard in every proposal built)
- Review ask built into delivery, every time, no exceptions
- Referral is already the only channel that's worked — formalise the ask instead of waiting for it
- Every delivered project becomes next month's Pillar 2 content — the loop closes and feeds REACH again

**Metric:** revenue against the ₹1.5L floor, retainer count, % of revenue from
any single client (currently a real risk — OTHO alone would be ~75% of
revenue if it closes as scoped).

---

## 3. Why the loop matters more than any single stage

RACE is a loop, not a funnel that ends. ENGAGE work (a finished case study, a
5-star review, a referral) becomes next month's REACH content. This is the
compounding mechanism behind the whole 100-day arc — it's also the reason
content shouldn't stop the moment cash gets tight. Every real client, however
small, is raw material for the stage before it.

---

## 4. The next 90 days, by RACE stage

**REACH, starting now:** GBP phone number fixed, posting resumes on
Instagram/Facebook at the set cadence, LinkedIn restarted from zero — this is
the most under-invested channel relative to its value.

**ACT, weeks 1–4:** Mahati/Aruna case studies published properly, Sattva
Amora used as the standing real-estate proof asset, FAQ extended, first
founder-as-evidence posts live.

**CONVERT, ongoing:** offer ladder used on every new prospect, not just
Designerz Hub. Explicit CTA on every piece of content, no exceptions.

**ENGAGE, from the first delivered project onward:** review requested,
referral asked for directly, case study drafted within a week of delivery
while the work is still fresh.

---

## 5. What I'm taking charge of, and what still comes to you

You said take the charge — here's the actual boundary, so it's not vague:

**I'll just do, without asking each time:** content topics, captions, copy
drafts, research, competitive/positioning analysis, structuring plans,
correcting inaccuracies I find (like the Vizag reference), building offer
and sales materials.

**Still comes to you first:** anything that spends money, anything sent to a
client (a proposal, a contract), anything published live for the first time
under this new plan (first LinkedIn relaunch post, corrected site copy going
live), and anything that changes what's promised to an existing client.

That's not me hedging — it's the same principle as the OTHO deal itself:
small, reversible things move fast; anything public or binding gets a look
first, at least until the track record says otherwise.

---

## 6. What's next, concretely

1. Fix the GBP phone number and post something — closes the 8-week silence
2. Find and correct the Vizag reference feeding AI answers
3. Draft the first week of LinkedIn posts from Pillar 1/4 — the most dormant, highest-value channel
4. Draft the first week of Instagram posts from the existing content batch (Mahati/Aruna/Sattva Amora material, zero new shoot cost)
5. Extend the FAQ with the objections actually surfacing in real pitches (price, trust, timeline — the same three you named for why deals are lost)

Say go and I'll start producing the actual posts, not just the plan for them.
