import { streamObject } from 'ai';
import { FlagResult } from '../_schemas';
import type { SourceAnchorOutput, TriangulateOutput } from '../_schemas';
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

const STAGE_PROMPT = `You are running Stage 3 of the Verifier: FLAG.

Your job: assign a red / amber / green level to each claim from Stage 1, and
tag any claim that matches one of the four failure modes.

For each claim, produce:
  - claim: copy the claim text from Stage 1. Keep them aligned 1:1.
  - level: one of
      "red"   - this claim should not be relied on as written. The artefact
                needs a rewrite or a real source before it goes further.
      "amber" - this claim is plausible but unverified. Confirm with the
                named owner or a second source before acting on it.
      "green" - this claim is well-sourced or low-stakes enough to forward.
  - failure_mode: one of
      "fabricated_source"
      "drifted_date"
      "plausible_wrong_number"
      "framing_distortion"
      "none"
    Use "none" if the claim is fine or the issue is just thin sourcing.
  - reason: one sentence naming the specific evidence for the level and
    failure mode. Quote the artefact where useful. "The artefact cites
    'People Analytics Q3 Pulse, p.18' but no such report appears in
    Confluence or in the People Analytics shared drive index." beats "the
    source seems unverifiable".

Be honest about greens. If a claim is well-sourced, marking it red costs you
credibility. The goal is decision-grade, not paranoid.

Forbidden phrases: "it is concerning that", "lacks rigour", "best practice
would be", "stakeholders should". Name the specific evidence.`;

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
  const { artefact, stream_label, prior } = (body ?? {}) as {
    artefact?: unknown;
    stream_label?: unknown;
    prior?: { source_anchor?: unknown; triangulate?: unknown };
  };
  if (!validateArtefact(artefact)) {
    return new Response('Invalid artefact', { status: 400 });
  }
  if (typeof stream_label !== 'string' || stream_label.length === 0) {
    return new Response('Invalid stream_label', { status: 400 });
  }
  if (!prior || !prior.source_anchor || !prior.triangulate) {
    return new Response('Missing prior stage outputs', { status: 400 });
  }
  const sourceAnchor = prior.source_anchor as SourceAnchorOutput;
  const triangulate = prior.triangulate as TriangulateOutput;

  const result = streamObject({
    model,
    schema: FlagResult,
    system: BASE_SYSTEM,
    prompt: `${STAGE_PROMPT}

Stream the user picked: ${stream_label}

The artefact:
"""
${artefact}
"""

Stage 1 (Source-anchor) output:
${JSON.stringify(sourceAnchor, null, 2)}

Stage 2 (Triangulate) output:
${JSON.stringify(triangulate, null, 2)}`,
    providerOptions: {
      anthropic: { cacheControl: { type: 'ephemeral' } },
    },
  });

  return result.toTextStreamResponse();
}
