import { z } from 'zod';

export const SourceAnchorResult = z.object({
  claims: z.array(z.object({
    claim: z.string(),
    status: z.enum(['cited', 'uncited', 'unverifiable']),
    cite_text: z.string().optional(),
    why: z.string(),
  })).min(2).max(8),
});

export const TriangulateResult = z.object({
  alt_framings: z.array(z.object({
    angle: z.string(),
    what_changes: z.string(),
    would_change_decision: z.string(),
  })).length(2),
});

export const FlagResult = z.object({
  flags: z.array(z.object({
    claim: z.string(),
    level: z.enum(['red', 'amber', 'green']),
    failure_mode: z.enum([
      'fabricated_source',
      'drifted_date',
      'plausible_wrong_number',
      'framing_distortion',
      'none',
    ]),
    reason: z.string(),
  })).min(2).max(8),
});

export const VerdictResult = z.object({
  overall: z.enum(['red', 'amber', 'green']),
  headline: z.string(),
  one_fix: z.string(),
  confidence_note: z.string(),
});

export type SourceAnchorOutput = z.infer<typeof SourceAnchorResult>;
export type TriangulateOutput = z.infer<typeof TriangulateResult>;
export type FlagOutput = z.infer<typeof FlagResult>;
export type VerdictOutput = z.infer<typeof VerdictResult>;
