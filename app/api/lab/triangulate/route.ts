import { streamObject } from 'ai';
import { TriangulateResult } from '../_schemas';
import {
  model,
  BASE_SYSTEM,
  ratelimit,
  checkKey,
  getIp,
  validateArtefact,
} from '../_shared';

export const runtime = 'nodejs';
export const maxDuration = 60;

const STAGE_PROMPT = `You are running Stage 2 of the Verifier: TRIANGULATE.

Your job: re-frame the artefact's central recommendation from two alternative
angles, and surface what changes between them.

For each alternative framing, produce:
  - angle: a one-line label for the alternative angle. Examples:
      "different time window: trailing 90 days instead of Q1 in isolation"
      "different cohort: org-wide average instead of top-quartile baseline"
      "opposite hypothesis: assume the dip is seasonal, not structural"
      "different denominator: per-account revenue instead of per-deal count"
      "second tool: what would the analyst rebuild from raw data say?"
  - what_changes: the specific finding or number that shifts under this
    framing. Quote the original's figure and give the re-framed one. Be
    concrete - "from 3.2x ROAS to ~1.1x ROAS" beats "the conclusion would
    look different".
  - would_change_decision: a single one-line answer: "yes" or "no" or
    "depends - explain in one half-sentence". Be honest. If the alternative
    framing would not change what a leader does on Monday, say no.

Return exactly 2 alternative framings - the two that most stress-test the
artefact's central recommendation, not its peripheral claims.

Lead with the framing most likely to flip the call. If both alternatives
leave the recommendation intact, lead with the one that most narrows the
recommended action.

Forbidden phrases: "it could be argued", "another perspective", "broadly
speaking", "in some cases", "more analysis is needed".`;

export async function POST(req: Request) {
  if (!checkKey(req)) return new Response('Unauthorized', { status: 401 });

  const { success } = await ratelimit.limit(getIp(req));
  if (!success) return new Response('Rate limited', { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
  const { artefact, stream_label } = (body ?? {}) as {
    artefact?: unknown;
    stream_label?: unknown;
  };
  if (!validateArtefact(artefact)) {
    return new Response('Invalid artefact', { status: 400 });
  }
  if (typeof stream_label !== 'string' || stream_label.length === 0) {
    return new Response('Invalid stream_label', { status: 400 });
  }

  const result = streamObject({
    model,
    schema: TriangulateResult,
    system: BASE_SYSTEM,
    prompt: `${STAGE_PROMPT}

Stream the user picked: ${stream_label}

The artefact:
"""
${artefact}
"""`,
    providerOptions: {
      anthropic: { cacheControl: { type: 'ephemeral' } },
    },
  });

  return result.toTextStreamResponse();
}
