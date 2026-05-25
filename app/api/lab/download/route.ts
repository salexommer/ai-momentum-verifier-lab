import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { checkKey } from '../_shared';

export const runtime = 'nodejs';
export const maxDuration = 30;

const FailureModeEnum = z.enum([
  'fabricated_source',
  'drifted_date',
  'plausible_wrong_number',
  'framing_distortion',
]);

const DownloadPayloadSchema = z.object({
  template: z.enum(['langdock', 'claude']),
  stream: z.string().min(1).max(64),
  encountered_modes: z.array(FailureModeEnum).max(8),
  thresholds: z.object({
    red: z.string().min(1).max(500),
    amber: z.string().min(1).max(500),
    green: z.string().min(1).max(500),
  }),
});

type FailureMode = z.infer<typeof FailureModeEnum>;

const MODE_DESCRIPTIONS: Record<FailureMode, string> = {
  fabricated_source: 'Citations to docs, URLs, or reports that do not exist.',
  drifted_date: 'Data from the wrong period presented as current.',
  plausible_wrong_number: 'Math errors that read correctly at a glance.',
  framing_distortion: 'Cherry-picked angle, cohort, or baseline.',
};

function formatModes(modes: FailureMode[]): string {
  if (modes.length === 0) {
    return 'None surfaced in your lab run. Watch for all four in future outputs.';
  }
  return modes
    .map((m) => `- **${m}** - ${MODE_DESCRIPTIONS[m]}`)
    .join('\n');
}

export async function POST(req: Request) {
  if (!checkKey(req)) return new Response('Unauthorized', { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const parsed = DownloadPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response('Invalid payload', { status: 400 });
  }
  const body = parsed.data;

  const filename =
    body.template === 'langdock'
      ? 'langdock-skill.md'
      : 'claude-agent.md';
  const downloadName =
    body.template === 'langdock'
      ? 'decision-grade-verifier-langdock-skill.md'
      : 'decision-grade-verifier-claude-agent.md';

  const templatePath = path.join(process.cwd(), 'lib', 'templates', filename);
  let content: string;
  try {
    content = await readFile(templatePath, 'utf-8');
  } catch {
    return new Response('Template not found', { status: 500 });
  }

  content = content
    .replaceAll('{{stream}}', body.stream)
    .replaceAll('{{encountered_modes_list}}', formatModes(body.encountered_modes))
    .replaceAll('{{red_threshold}}', body.thresholds.red)
    .replaceAll('{{amber_threshold}}', body.thresholds.amber)
    .replaceAll('{{green_threshold}}', body.thresholds.green);

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${downloadName}"`,
    },
  });
}
