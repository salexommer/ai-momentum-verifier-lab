# AI Momentum Verifier Lab

> Topic 4 participant lab for the Personio AI Momentum programme. ~25-minute hands-on segment where ~200 participants verify an AI-generated artefact against three checks (source-anchor, triangulate, confidence label) and four failure modes (fabricated_source, drifted_date, plausible_wrong_number, framing_distortion). Each participant downloads two runtime-personalised verifier files (Langdock Skill + Claude Code subagent).

**Status:** scaffold (Phase 1). Stage routes, components, download endpoint, integration, and testing land in Phases 2 through 6.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind 4
- Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`)
- Zod for schema-validated streaming objects
- Framer Motion for staged reveals
- `@upstash/ratelimit` + `@upstash/redis` for per-IP rate limiting

## Environment variables

Required (set in Vercel):

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude Sonnet 4.6 API key. **Org must be on Tier 2+ for cohort delivery.** |
| `VERIFIER_LAB_KEY` | Session passcode in `?key=` query string. Rotate within 1h of session end. |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (free tier sufficient). |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token. |

See `.env.example` for the template.

## Development

```bash
npm install
cp .env.example .env.local  # fill in real values
npm run dev
# open http://localhost:3000/?key=verify
```

## Build spec

The canonical build spec lives in the AI Momentum monorepo:

- `baseline/topic-4-data-literacy/resources/Alex's Notes Topic 4/verifier-lab-starter-kit.md` - source of truth for prompts, schemas, scenarios, templates
- `baseline/topic-4-data-literacy/resources/Alex's Notes Topic 4/verifier-lab-build-plan.md` - phase-by-phase build plan

## Fallback prompt

If the lab is unreachable mid-session, participants can paste the fallback prompt (printed on the lab slide) directly into Langdock or Claude. The fallback runs the same four-stage verifier without the wrapper - degraded UX, still functional.

## Companion lab

`salexommer/ai-momentum-lab` - the Topic 3 Shadow Workflow Lab. Same stack family. Different verifier vs. shadow purpose.

---

Built for the Personio AI Momentum programme by Alex Sommer (Oli) with Claude.
