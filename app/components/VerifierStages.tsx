'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import {
  SourceAnchorResult,
  TriangulateResult,
  FlagResult,
  VerdictResult,
} from '@/app/api/lab/_schemas';
import type {
  SourceAnchorOutput,
  TriangulateOutput,
  FlagOutput,
  VerdictOutput,
} from '@/app/api/lab/_schemas';
import type { Scenario } from '@/lib/scenarios';
import { TopKicker, PrimaryCTA, ScreenContainer } from '@/app/components/atoms';

type VerifierStagesProps = {
  scenario: Scenario;
  customBody?: string;
  passcode: string;
  onAllDone: (results: {
    sourceAnchor: SourceAnchorOutput;
    triangulate: TriangulateOutput;
    flag: FlagOutput;
    verdict: VerdictOutput;
  }) => void;
};

const STAGE_NAMES = ['Source-anchor', 'Triangulate', 'Flag', 'Verdict'] as const;

const fadeItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const statusStyles: Record<string, string> = {
  cited: 'bg-green-500/20 text-green-300',
  uncited: 'bg-amber-500/20 text-amber-300',
  unverifiable: 'bg-red-500/20 text-red-300',
};

const levelDot: Record<string, string> = {
  red: 'bg-red-500',
  amber: 'bg-amber-400',
  green: 'bg-green-500',
};

const overallStyles: Record<string, string> = {
  red: 'text-red-400',
  amber: 'text-amber-400',
  green: 'text-green-400',
};

const failureModeStyles: Record<string, string> = {
  fabricated_source: 'bg-red-500/20 text-red-300',
  drifted_date: 'bg-amber-500/20 text-amber-300',
  plausible_wrong_number: 'bg-orange-500/20 text-orange-300',
  framing_distortion: 'bg-purple-500/20 text-purple-300',
  none: 'bg-slate-700/40 text-slate-400',
};

function StageHeader({ n, name, sub }: { n: number; name: string; sub: string }) {
  return (
    <div className="mb-4">
      <p className="text-[12px] tracking-[0.22em] text-amber-400 uppercase font-medium tabular-nums mb-2">
        0{n} · {name}
      </p>
      <p className="text-slate-300 text-[14px]">{sub}</p>
    </div>
  );
}

export default function VerifierStages({
  scenario,
  customBody,
  passcode,
  onAllDone,
}: VerifierStagesProps) {
  const artefact = scenario.body ?? customBody ?? '';
  const stream_label = scenario.id;
  const key = encodeURIComponent(passcode);

  const [currentStage, setCurrentStage] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [stage1Result, setStage1Result] = useState<SourceAnchorOutput | null>(null);
  const [stage2Result, setStage2Result] = useState<TriangulateOutput | null>(null);
  const [stage3Result, setStage3Result] = useState<FlagOutput | null>(null);
  const [stage4Result, setStage4Result] = useState<VerdictOutput | null>(null);

  const stage1 = useObject({
    api: `/api/lab/source-anchor?key=${key}`,
    schema: SourceAnchorResult,
    onFinish: ({ object }) => {
      if (object) setStage1Result(object as SourceAnchorOutput);
    },
  });

  const stage2 = useObject({
    api: `/api/lab/triangulate?key=${key}`,
    schema: TriangulateResult,
    onFinish: ({ object }) => {
      if (object) setStage2Result(object as TriangulateOutput);
    },
  });

  const stage3 = useObject({
    api: `/api/lab/flag?key=${key}`,
    schema: FlagResult,
    onFinish: ({ object }) => {
      if (object) setStage3Result(object as FlagOutput);
    },
  });

  const stage4 = useObject({
    api: `/api/lab/verdict?key=${key}`,
    schema: VerdictResult,
    onFinish: ({ object }) => {
      if (object) setStage4Result(object as VerdictOutput);
    },
  });

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    setCurrentStage(1);
    stage1.submit({ artefact, stream_label });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function advanceToStage2() {
    setCurrentStage(2);
    stage2.submit({ artefact, stream_label });
  }

  function advanceToStage3() {
    setCurrentStage(3);
    stage3.submit({ artefact, stream_label, prior: { source_anchor: stage1Result, triangulate: stage2Result } });
  }

  function advanceToStage4() {
    setCurrentStage(4);
    stage4.submit({ artefact, stream_label, prior: { source_anchor: stage1Result, triangulate: stage2Result, flag: stage3Result } });
  }

  function handleVerdictDone() {
    if (stage1Result && stage2Result && stage3Result && stage4Result) {
      onAllDone({
        sourceAnchor: stage1Result,
        triangulate: stage2Result,
        flag: stage3Result,
        verdict: stage4Result,
      });
    }
  }

  const activeStageName = currentStage >= 1 && currentStage <= 4 ? STAGE_NAMES[currentStage - 1] : '';

  const claims1 = stage1.object?.claims ?? [];
  const framings2 = stage2.object?.alt_framings ?? [];
  const flags3 = stage3.object?.flags ?? [];
  const verdict4 = stage4.object;

  const errors = [stage1.error, stage2.error, stage3.error, stage4.error].filter(Boolean);

  return (
    <ScreenContainer label="06 VerifierStages">
      <div className="mb-10">
        <TopKicker />
        <h1 className="font-serif font-light text-[36px] md:text-[44px] leading-[1.05] tracking-[-0.01em] text-slate-100 mt-3">
          Running the Verifier.<br />
          <span className="text-slate-300">{scenario.title}</span>
        </h1>
        {currentStage >= 1 && currentStage <= 4 && (
          <p className="text-[12px] tracking-[0.18em] uppercase text-amber-400 mt-3">
            Stage {currentStage}/4 — {activeStageName}
          </p>
        )}
      </div>

      <div className="space-y-10">

        {/* Stage 1 — Source-anchor */}
        {currentStage >= 1 && (
          <motion.section {...fadeItem} transition={{ duration: 0.3 }}>
            <StageHeader
              n={1}
              name="Source-anchor"
              sub="Every claim, tagged for source status."
            />
            {stage1.isLoading && claims1.length === 0 && (
              <p className="text-[12px] text-slate-500 animate-pulse">Streaming...</p>
            )}
            <div className="space-y-3">
              {claims1.map((c, i) => (
                <motion.div
                  key={i}
                  {...fadeItem}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1"
                >
                  <div className="flex items-start gap-3">
                    {c?.status && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${statusStyles[c.status] ?? ''}`}>
                        {c.status}
                      </span>
                    )}
                    <p className="text-slate-100 text-sm">{c?.claim}</p>
                  </div>
                  {c?.cite_text && (
                    <p className="text-slate-400 text-sm italic pl-2">{c.cite_text}</p>
                  )}
                  {c?.why && (
                    <p className="text-slate-300 text-sm pl-2">{c.why}</p>
                  )}
                </motion.div>
              ))}
            </div>
            {stage1.isLoading && claims1.length > 0 && (
              <p className="text-[12px] text-slate-500 animate-pulse mt-3">Streaming...</p>
            )}
            {stage1Result && currentStage === 1 && (
              <motion.div
                {...fadeItem}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-6 flex justify-end"
              >
                <PrimaryCTA onClick={advanceToStage2}>
                  Continue to Triangulate →
                </PrimaryCTA>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* Stage 2 — Triangulate */}
        {currentStage >= 2 && (
          <motion.section {...fadeItem} transition={{ duration: 0.3 }}>
            <StageHeader
              n={2}
              name="Triangulate"
              sub="Alternative framings that would change the decision."
            />
            {stage2.isLoading && framings2.length === 0 && (
              <p className="text-[12px] text-slate-500 animate-pulse">Streaming...</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {framings2.map((f, i) => (
                <motion.div
                  key={i}
                  {...fadeItem}
                  transition={{ duration: 0.25, delay: i * 0.07 }}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col gap-2"
                >
                  <p className="font-semibold text-amber-300 text-sm">{f?.angle}</p>
                  <p className="text-slate-200 text-sm flex-1">{f?.what_changes}</p>
                  {f?.would_change_decision && (
                    <span className="self-start text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 mt-1">
                      {f.would_change_decision}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
            {stage2.isLoading && framings2.length > 0 && (
              <p className="text-[12px] text-slate-500 animate-pulse mt-3">Streaming...</p>
            )}
            {stage2Result && currentStage === 2 && (
              <motion.div
                {...fadeItem}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-6 flex justify-end"
              >
                <PrimaryCTA onClick={advanceToStage3}>
                  Continue to Flag →
                </PrimaryCTA>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* Stage 3 — Flag */}
        {currentStage >= 3 && (
          <motion.section {...fadeItem} transition={{ duration: 0.3 }}>
            <StageHeader
              n={3}
              name="Flag"
              sub="Claims rated by failure mode."
            />
            {stage3.isLoading && flags3.length === 0 && (
              <p className="text-[12px] text-slate-500 animate-pulse">Streaming...</p>
            )}
            <div className="space-y-3">
              {flags3.map((f, i) => (
                <motion.div
                  key={i}
                  {...fadeItem}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-1"
                >
                  <div className="flex items-start gap-3">
                    {f?.level && (
                      <span className={`inline-block rounded-full w-3 h-3 shrink-0 mt-1 ${levelDot[f.level] ?? 'bg-slate-500'}`} />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-slate-100 text-sm">{f?.claim}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {f?.failure_mode && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${failureModeStyles[f.failure_mode] ?? 'bg-slate-700 text-slate-400'}`}>
                            {f.failure_mode.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      {f?.reason && (
                        <p className="text-slate-300 text-sm">{f.reason}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {stage3.isLoading && flags3.length > 0 && (
              <p className="text-[12px] text-slate-500 animate-pulse mt-3">Streaming...</p>
            )}
            {stage3Result && currentStage === 3 && (
              <motion.div
                {...fadeItem}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-6 flex justify-end"
              >
                <PrimaryCTA onClick={advanceToStage4}>
                  Continue to Verdict →
                </PrimaryCTA>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* Stage 4 — Verdict */}
        {currentStage >= 4 && (
          <motion.section {...fadeItem} transition={{ duration: 0.3 }}>
            <StageHeader
              n={4}
              name="Verdict"
              sub="Overall assessment and the single highest-leverage fix."
            />
            {stage4.isLoading && !verdict4 && (
              <p className="text-[12px] text-slate-500 animate-pulse">Streaming...</p>
            )}
            {verdict4 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-5">
                {verdict4?.overall && (
                  <p className={`text-4xl font-bold uppercase ${overallStyles[verdict4.overall] ?? 'text-slate-400'}`}>
                    {verdict4.overall}
                  </p>
                )}
                {verdict4?.headline && (
                  <p className="font-serif text-xl text-slate-100 leading-snug">{verdict4.headline}</p>
                )}
                {verdict4?.one_fix && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-400 mb-1">The one fix</p>
                    <p className="text-slate-200 text-sm">{verdict4.one_fix}</p>
                  </div>
                )}
                {verdict4?.confidence_note && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">What the verifier is less sure about</p>
                    <p className="text-slate-400 text-sm">{verdict4.confidence_note}</p>
                  </div>
                )}
              </div>
            )}
            {stage4.isLoading && verdict4 && (
              <p className="text-[12px] text-slate-500 animate-pulse mt-3">Streaming...</p>
            )}
            {stage4Result && (
              <motion.div
                {...fadeItem}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-6 flex justify-end"
              >
                <PrimaryCTA onClick={handleVerdictDone}>
                  See the verdict →
                </PrimaryCTA>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* Error toasts */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((err, i) => (
              <p key={i} className="text-red-400 text-sm">
                Stage failed: {err?.message ?? 'Unknown error'}. Refresh and try again.
              </p>
            ))}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
