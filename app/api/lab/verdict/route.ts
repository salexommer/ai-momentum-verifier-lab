import { streamObject } from 'ai';
import { VerdictResult } from '../_schemas';
import type {
  SourceAnchorOutput,
  TriangulateOutput,
  FlagOutput,
} from '../_schemas';
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

const STAGE_PROMPT = `You are running Stage 4 of the Verifier: VERDICT.

Your job: collapse the previous three stages into a single decision-grade
verdict - red, amber, or green overall - plus the single most-leveraged fix.

Produce:
  - overall: one of "red", "amber", "green".
      red    - do not forward as written. At least one load-bearing claim
               failed source-anchor or triangulation.
      amber  - forward with a named caveat. The recommendation may stand but
               one or more inputs need confirming.
      green  - forward as is. The artefact survives the three checks.

    Calibration rule: amber is the default for artefacts with sourcing or
    framing problems where the central claim still survives. Only escalate
    to red if (a) a specific number materially inverts the recommendation,
    or (b) a load-bearing citation is unverifiable AND no alternative
    source is plausible. If the core finding is directionally true but
    needs a named fix, that is amber, not red. If a thin Custom artefact
    has only one claim and a single missing source, that is amber, not red
    - the author has not yet had the chance to add the source.
  - headline: one sentence the user could paste into a Slack message to their
    manager. It should name the artefact's central claim and the level in
    plain English. If the prior stages contain a mix of red, amber, and
    green claims, the headline must name what survives, not only what
    fails. Example: "The 47% Cohort A attrition number is wrong; the
    underlying retention concern is real but the memo needs a rewrite
    before it goes to the SLT."
  - one_fix: ONE edit to the document, completable in 10 minutes. Name the
    section, the claim, and the change. Single-action only - do not chain
    compound tasks. If the edit requires first locating a source, write it
    as one action: "In paragraph X, replace [claim] with the figure from
    [where the user must look], or if absent, replace with [specific
    alternative]." Not "verify your sources". Example: "Replace the 'People
    Analytics Q3 Pulse, p.18' citation in paragraph 2 with the actual Q1
    2026 attrition report from the People Analytics shared drive, and
    update the figure from 47% to whatever the report says."
  - confidence_note: one sentence on what you are NOT confident about in
    your own verdict. The verifier is also fallible. Be honest about which
    claim you flagged that you would want a human to double-check.

Forbidden phrases: "overall, the artefact", "in conclusion", "it is
recommended that", "further investigation is warranted", "various
stakeholders". Be a peer naming the call.`;

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
    prior?: { source_anchor?: unknown; triangulate?: unknown; flag?: unknown };
  };
  if (!validateArtefact(artefact)) {
    return new Response('Invalid artefact', { status: 400 });
  }
  if (typeof stream_label !== 'string' || stream_label.length === 0) {
    return new Response('Invalid stream_label', { status: 400 });
  }
  if (!prior || !prior.source_anchor || !prior.triangulate || !prior.flag) {
    return new Response('Missing prior stage outputs', { status: 400 });
  }
  const sourceAnchor = prior.source_anchor as SourceAnchorOutput;
  const triangulate = prior.triangulate as TriangulateOutput;
  const flag = prior.flag as FlagOutput;

  const result = streamObject({
    model,
    schema: VerdictResult,
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
${JSON.stringify(triangulate, null, 2)}

Stage 3 (Flag) output:
${JSON.stringify(flag, null, 2)}`,
    providerOptions: {
      anthropic: { cacheControl: { type: 'ephemeral' } },
    },
  });

  return result.toTextStreamResponse();
}
