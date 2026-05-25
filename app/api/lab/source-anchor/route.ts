import { streamObject } from 'ai';
import { SourceAnchorResult } from '../_schemas';
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

const STAGE_PROMPT = `You are running Stage 1 of the Verifier: SOURCE-ANCHOR.

Your job: extract every factual claim in the artefact that depends on a source
(a number, a benchmark, a comparison, a citation, a date-bounded statement)
and tag each one with its source status.

For each claim, produce:
  - claim: a one-sentence restatement of the claim, in the artefact's own
    language. Quote the exact figure or phrase where one is given.
  - status: one of
      "cited"        - the artefact names a specific source (doc, URL, report,
                       dashboard) for this claim
      "uncited"      - the artefact gives a number or benchmark without naming
                       where it came from
      "unverifiable" - the artefact names a source, but the source is too
                       vague to actually look up, or you have reason to doubt
                       the source exists (e.g. "Q3 Pulse Report, p.18" with
                       no link or doc ID)
  - cite_text: if status is "cited" or "unverifiable", the exact source phrase
    from the artefact. Omit otherwise.
  - why: one sentence on why this status. Be specific. For "unverifiable",
    name the doubt ("no link given, no shared owner named, the figure is
    rounded in a way real data rarely is").

Return 4-8 claims. Lead with the most load-bearing one - the claim the
recommendation hangs on. If the artefact has fewer than 4 sourced claims,
still return everything that depends on a source, even if it is only 2 or 3.

Forbidden phrases: "comprehensive analysis", "robust methodology", "consider
verifying", "may benefit from additional context", "as appropriate". Name the
specific claim.`;

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
    schema: SourceAnchorResult,
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
