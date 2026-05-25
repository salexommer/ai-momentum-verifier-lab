'use client';

import { motion, type Easing } from 'framer-motion';
import type {
  SourceAnchorOutput,
  TriangulateOutput,
  FlagOutput,
  VerdictOutput,
} from '@/app/api/lab/_schemas';

type LineageResultProps = {
  sourceAnchor: SourceAnchorOutput;
  triangulate: TriangulateOutput;
  flag: FlagOutput;
  verdict: VerdictOutput;
};

type FlagLevel = 'red' | 'amber' | 'green';

const FAILURE_MODES = [
  'fabricated_source',
  'drifted_date',
  'plausible_wrong_number',
  'framing_distortion',
] as const;

function worstFlagLevel(flags: FlagOutput['flags']): FlagLevel {
  if (flags.some((f) => f.level === 'red')) return 'red';
  if (flags.some((f) => f.level === 'amber')) return 'amber';
  return 'green';
}

const levelBorderClass: Record<FlagLevel, string> = {
  red: 'border-l-4 border-red-500',
  amber: 'border-l-4 border-amber-500',
  green: 'border-l-4 border-green-500',
};

const levelBgClass: Record<FlagLevel, string> = {
  red: 'bg-red-500/20',
  amber: 'bg-amber-500/20',
  green: 'bg-green-500/20',
};

const levelTextClass: Record<FlagLevel, string> = {
  red: 'text-red-300',
  amber: 'text-amber-300',
  green: 'text-green-300',
};

const levelPillClass: Record<FlagLevel, string> = {
  red: 'bg-red-500/30 text-red-300 border border-red-500/50',
  amber: 'bg-amber-500/30 text-amber-300 border border-amber-500/50',
  green: 'bg-green-500/30 text-green-300 border border-green-500/50',
};

const EASE_OUT: Easing = 'easeOut';

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.35, ease: EASE_OUT },
  }),
};

const arrowVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.1 + 0.3, duration: 0.2 },
  }),
};

export default function LineageResult({
  sourceAnchor,
  triangulate,
  flag,
  verdict,
}: LineageResultProps) {
  const claimCounts = sourceAnchor.claims.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const cited = claimCounts['cited'] ?? 0;
  const uncited = claimCounts['uncited'] ?? 0;
  const unverifiable = claimCounts['unverifiable'] ?? 0;
  const totalClaims = sourceAnchor.claims.length;

  const changingFramings = triangulate.alt_framings.filter((f) =>
    f.would_change_decision.toLowerCase().startsWith('yes'),
  ).length;

  const flagCounts = { red: 0, amber: 0, green: 0 };
  for (const f of flag.flags) flagCounts[f.level]++;

  const worstLevel = worstFlagLevel(flag.flags);

  const failureModeCounts = FAILURE_MODES.reduce(
    (acc, mode) => {
      acc[mode] = flag.flags.filter((f) => f.failure_mode === mode).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <section className="max-w-5xl mx-auto p-8 space-y-12">
      {/* BAND 1 — Lineage visual */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
          {/* Stage 1 — Source-Anchor */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-slate-900 border-l-4 border-slate-500 rounded-lg p-5 flex flex-col gap-2"
          >
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Stage 1 — Source-Anchor
            </span>
            <span className="text-5xl font-bold text-slate-100">{totalClaims}</span>
            <span className="text-sm text-slate-400">
              claims found. {cited} cited, {uncited} uncited, {unverifiable} unverifiable.
            </span>
          </motion.div>

          <motion.div
            custom={0.5}
            variants={arrowVariants}
            initial="hidden"
            animate="visible"
            className="hidden md:flex items-center justify-center text-slate-600 text-2xl select-none"
          >
            ›
          </motion.div>

          {/* Stage 2 — Triangulate */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-slate-900 border-l-4 border-slate-500 rounded-lg p-5 flex flex-col gap-2"
          >
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Stage 2 — Triangulate
            </span>
            <span className="text-5xl font-bold text-slate-100">2</span>
            <span className="text-sm text-slate-400">
              alternative framings. {changingFramings} would change the decision.
            </span>
          </motion.div>

          <motion.div
            custom={1.5}
            variants={arrowVariants}
            initial="hidden"
            animate="visible"
            className="hidden md:flex items-center justify-center text-slate-600 text-2xl select-none"
          >
            ›
          </motion.div>

          {/* Stage 3 — Flag */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`bg-slate-900 ${levelBorderClass[worstLevel]} rounded-lg p-5 flex flex-col gap-2`}
          >
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Stage 3 — Flag
            </span>
            <span className="text-5xl font-bold text-slate-100">{flag.flags.length}</span>
            <span className="text-sm text-slate-400">
              {flagCounts.red} red, {flagCounts.amber} amber, {flagCounts.green} green.
            </span>
          </motion.div>

          <motion.div
            custom={2.5}
            variants={arrowVariants}
            initial="hidden"
            animate="visible"
            className="hidden md:flex items-center justify-center text-slate-600 text-2xl select-none"
          >
            ›
          </motion.div>

          {/* Stage 4 — Verdict */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`${levelBgClass[verdict.overall]} rounded-lg p-5 flex flex-col gap-2`}
          >
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Stage 4 — Verdict
            </span>
            <span
              className={`text-4xl md:text-5xl font-bold uppercase ${levelTextClass[verdict.overall]}`}
            >
              {verdict.overall}
            </span>
          </motion.div>
        </div>
      </div>

      {/* BAND 2 — Theory sidebar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
        className="bg-slate-900 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-slate-100 mb-6">
          Theory you just applied.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left — The three checks */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
              The three checks
            </p>
            <ul className="space-y-2">
              {['Source-anchor', 'Triangulate', 'Confidence label'].map((check) => (
                <li key={check} className="flex items-center gap-3 text-slate-200">
                  <svg
                    className="w-4 h-4 text-green-400 shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8l3.5 3.5L13 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — The four failure modes */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
              The four failure modes
            </p>
            <ul className="space-y-2">
              {FAILURE_MODES.map((mode) => {
                const count = failureModeCounts[mode] ?? 0;
                const encountered = count > 0;
                return (
                  <li key={mode} className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-sm ${
                        encountered ? 'text-amber-300' : 'text-slate-500'
                      }`}
                    >
                      {mode.replace(/_/g, ' ')}
                    </span>
                    {encountered && (
                      <span className="text-xs text-amber-400 font-semibold">
                        x{count}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* BAND 3 — Verdict + the one fix */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4, ease: 'easeOut' }}
        className="space-y-5"
      >
        <div className="flex items-center gap-4">
          <span
            className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide ${levelPillClass[verdict.overall]}`}
          >
            {verdict.overall}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-serif text-slate-100 leading-tight">
          {verdict.headline}
        </h3>

        <div className="space-y-1">
          <p className="text-sm uppercase tracking-widest text-amber-400">The one fix:</p>
          <p className="text-slate-200 text-lg">{verdict.one_fix}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm uppercase tracking-widest text-slate-500">
            What the verifier is less sure about:
          </p>
          <p className="text-slate-400 text-sm italic">{verdict.confidence_note}</p>
        </div>
      </motion.div>
    </section>
  );
}
