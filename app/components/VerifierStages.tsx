'use client';

import { useState } from 'react';
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

type StageStatus = 'intro' | 'streaming' | 'done';

const fadeItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const statusPill: Record<string, string> = {
  cited: 'bg-green-300 text-green-900',
  uncited: 'bg-amber-300 text-amber-900',
  unverifiable: 'bg-red-300 text-red-900',
};

const levelDot: Record<string, string> = {
  red: 'bg-red-500',
  amber: 'bg-amber-400',
  green: 'bg-green-500',
};

const overallChipBg: Record<string, string> = {
  red: 'bg-red-500/20 text-red-200',
  amber: 'bg-amber-500/20 text-amber-200',
  green: 'bg-green-500/20 text-green-200',
};

const failureModeLabel: Record<string, string> = {
  fabricated_source: 'fabricated source',
  drifted_date: 'drifted date',
  plausible_wrong_number: 'plausible wrong number',
  framing_distortion: 'framing distortion',
};

const FAILURE_MODES = [
  'fabricated_source',
  'drifted_date',
  'plausible_wrong_number',
  'framing_distortion',
] as const;

function decisionPillClass(text: string): string {
  const lower = text.toLowerCase();
  if (lower.startsWith('yes')) return 'bg-red-500/15 text-red-300';
  if (lower.startsWith('no')) return 'bg-slate-700 text-slate-300';
  return 'bg-amber-500/15 text-amber-300';
}

function StageDivider() {
  return <div className="my-6 border-t border-slate-800" />;
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

  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1);

  const [stage1Status, setStage1Status] = useState<StageStatus>('intro');
  const [stage2Status, setStage2Status] = useState<StageStatus>('intro');
  const [stage3Status, setStage3Status] = useState<StageStatus>('intro');
  const [stage4Status, setStage4Status] = useState<StageStatus>('intro');

  const [stage1Result, setStage1Result] = useState<SourceAnchorOutput | null>(null);
  const [stage2Result, setStage2Result] = useState<TriangulateOutput | null>(null);
  const [stage3Result, setStage3Result] = useState<FlagOutput | null>(null);
  const [stage4Result, setStage4Result] = useState<VerdictOutput | null>(null);

  const stage1 = useObject({
    api: `/api/lab/source-anchor?key=${key}`,
    schema: SourceAnchorResult,
    onFinish: ({ object }) => {
      if (object) {
        setStage1Result(object as SourceAnchorOutput);
        setStage1Status('done');
      }
    },
  });

  const stage2 = useObject({
    api: `/api/lab/triangulate?key=${key}`,
    schema: TriangulateResult,
    onFinish: ({ object }) => {
      if (object) {
        setStage2Result(object as TriangulateOutput);
        setStage2Status('done');
      }
    },
  });

  const stage3 = useObject({
    api: `/api/lab/flag?key=${key}`,
    schema: FlagResult,
    onFinish: ({ object }) => {
      if (object) {
        setStage3Result(object as FlagOutput);
        setStage3Status('done');
      }
    },
  });

  const stage4 = useObject({
    api: `/api/lab/verdict?key=${key}`,
    schema: VerdictResult,
    onFinish: ({ object }) => {
      if (object) {
        setStage4Result(object as VerdictOutput);
        setStage4Status('done');
      }
    },
  });

  function runStage1() {
    setStage1Status('streaming');
    stage1.submit({ artefact, stream_label });
  }

  function runStage2() {
    setStage1Status('done');
    setCurrentStage(2);
    setStage2Status('streaming');
    stage2.submit({ artefact, stream_label });
  }

  function runStage3() {
    setStage2Status('done');
    setCurrentStage(3);
    setStage3Status('streaming');
    stage3.submit({
      artefact,
      stream_label,
      prior: { source_anchor: stage1Result, triangulate: stage2Result },
    });
  }

  function runStage4() {
    setStage3Status('done');
    setCurrentStage(4);
    setStage4Status('streaming');
    stage4.submit({
      artefact,
      stream_label,
      prior: {
        source_anchor: stage1Result,
        triangulate: stage2Result,
        flag: stage3Result,
      },
    });
  }

  function handleAllDone() {
    if (stage1Result && stage2Result && stage3Result && stage4Result) {
      onAllDone({
        sourceAnchor: stage1Result,
        triangulate: stage2Result,
        flag: stage3Result,
        verdict: stage4Result,
      });
    }
  }

  const claims1 = stage1.object?.claims ?? [];
  const framings2 = stage2.object?.alt_framings ?? [];
  const flags3 = stage3.object?.flags ?? [];
  const verdict4 = stage4.object;

  const failureModeCounts = FAILURE_MODES.reduce(
    (acc, mode) => {
      acc[mode] = (stage3Result?.flags ?? []).filter((f) => f.failure_mode === mode).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <ScreenContainer label="06 VerifierStages">
      <div className="mb-10">
        <TopKicker />
        <h1 className="font-serif font-light text-[40px] md:text-[48px] leading-[1.05] tracking-[-0.01em] text-slate-100 mt-3">
          Running the Verifier.
        </h1>
        <p className="text-slate-300 text-[17px] mt-2">
          <span>{scenario.title}</span>
        </p>
      </div>

      <div className="space-y-12 mt-12">

        {/* Stage 1 - Source-anchor */}
        <motion.section {...fadeItem} transition={{ duration: 0.3 }}>
          <p className="text-[11px] tracking-[0.22em] text-amber-400 uppercase font-medium tabular-nums mb-2">
            01 · Stage 1 of 4
          </p>
          <h2 className="font-serif font-light text-[28px] md:text-[32px] leading-tight text-slate-100 mb-4">
            Source-anchor
          </h2>
          <p className="text-slate-300 text-[15.5px] leading-relaxed max-w-[600px] mb-6">
            First check: source-anchor. The Verifier extracts every load-bearing claim from the artefact (a number, a benchmark, a citation, a date-bounded statement) and tags each one as cited, uncited, or unverifiable. It will quote the exact source phrase from the artefact where one is given, and name the doubt where it suspects the source does not exist.
          </p>

          {stage1Status === 'intro' && (
            <PrimaryCTA onClick={runStage1}>Run source-anchor</PrimaryCTA>
          )}

          {stage1Status !== 'intro' && (
            <>
              <StageDivider />
              {stage1.isLoading && claims1.length === 0 && (
                <p className="text-[12px] text-slate-500 animate-pulse mb-4">Streaming...</p>
              )}
              <div className="space-y-3">
                {claims1.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1"
                  >
                    <div className="flex items-start gap-3">
                      {c?.status && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${statusPill[c.status] ?? ''}`}>
                          {c.status}
                        </span>
                      )}
                      <p className="text-slate-100 text-[15.5px] leading-relaxed">{c?.claim}</p>
                    </div>
                    {c?.cite_text && (
                      <p className="text-slate-400 text-[13.5px] italic mt-1 pl-2">
                        Source phrase: {c.cite_text}
                      </p>
                    )}
                    {c?.why && (
                      <p className="text-slate-300 text-[13.5px] mt-1 pl-2">{c.why}</p>
                    )}
                  </motion.div>
                ))}
              </div>
              {stage1.isLoading && claims1.length > 0 && (
                <p className="text-[12px] text-slate-500 animate-pulse mt-3">Streaming...</p>
              )}
              {stage1.error && (
                <p className="text-red-400 text-sm mt-3">
                  Stage 1 failed: {stage1.error.message ?? 'Unknown error'}. Refresh and try again.
                </p>
              )}
              {stage1Status === 'done' && currentStage === 1 && (
                <motion.div
                  {...fadeItem}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-6 flex justify-end"
                >
                  <PrimaryCTA onClick={() => { setCurrentStage(2); }}>Continue</PrimaryCTA>
                </motion.div>
              )}
            </>
          )}
        </motion.section>

        {/* Stage 2 - Triangulate */}
        {currentStage >= 2 && (
          <motion.section {...fadeItem} transition={{ duration: 0.3 }}>
            <p className="text-[11px] tracking-[0.22em] text-amber-400 uppercase font-medium tabular-nums mb-2">
              02 · Stage 2 of 4
            </p>
            <h2 className="font-serif font-light text-[28px] md:text-[32px] leading-tight text-slate-100 mb-4">
              Triangulate
            </h2>
            <p className="text-slate-300 text-[15.5px] leading-relaxed max-w-[600px] mb-6">
              Second check: triangulate. The Verifier re-frames the artefact's central recommendation from two alternative angles (a different time window, cohort, baseline, denominator, opposite hypothesis, or second tool). For each framing it surfaces the specific number that shifts, and whether the recommendation would change on Monday morning.
            </p>

            {stage2Status === 'intro' && (
              <PrimaryCTA onClick={runStage2}>Run triangulate</PrimaryCTA>
            )}

            {stage2Status !== 'intro' && (
              <>
                <StageDivider />
                {stage2.isLoading && framings2.length === 0 && (
                  <p className="text-[12px] text-slate-500 animate-pulse mb-4">Streaming...</p>
                )}
                <div className="space-y-0">
                  {framings2.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      {i > 0 && <div className="my-6 border-t border-slate-800" />}
                      <p className="text-[11px] tracking-[0.22em] text-amber-400 uppercase mb-3">
                        Alternative framing {i + 1}
                      </p>
                      <div className="border border-slate-800 rounded-lg p-6 bg-slate-900/50">
                        <ul className="space-y-0">
                          <li className="mt-0">
                            <div className="flex items-start gap-3">
                              <span className="mt-[6px] w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                              <div>
                                <span className="text-slate-500 text-[12px] uppercase tracking-wider">Angle</span>
                                <p className="text-slate-100 text-[16px] leading-snug font-medium mt-0.5">{f?.angle}</p>
                              </div>
                            </div>
                          </li>
                          <li className="mt-3">
                            <div className="flex items-start gap-3">
                              <span className="mt-[6px] w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                              <div>
                                <span className="text-slate-500 text-[12px] uppercase tracking-wider">What changes</span>
                                <p className="text-slate-200 text-[15px] leading-relaxed mt-0.5">{f?.what_changes}</p>
                              </div>
                            </div>
                          </li>
                          <li className="mt-3">
                            <div className="flex items-start gap-3">
                              <span className="mt-[6px] w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                              <div>
                                <span className="text-slate-500 text-[12px] uppercase tracking-wider">Decision impact</span>
                                <p className="mt-1">
                                  {f?.would_change_decision && (
                                    <span className={`inline-block text-[13px] px-2.5 py-0.5 rounded-full ${decisionPillClass(f.would_change_decision)}`}>
                                      {f.would_change_decision}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {stage2.isLoading && framings2.length > 0 && (
                  <p className="text-[12px] text-slate-500 animate-pulse mt-3">Streaming...</p>
                )}
                {stage2.error && (
                  <p className="text-red-400 text-sm mt-3">
                    Stage 2 failed: {stage2.error.message ?? 'Unknown error'}. Refresh and try again.
                  </p>
                )}
                {stage2Status === 'done' && currentStage === 2 && (
                  <motion.div
                    {...fadeItem}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-6 flex justify-end"
                  >
                    <PrimaryCTA onClick={() => { setCurrentStage(3); }}>Continue</PrimaryCTA>
                  </motion.div>
                )}
              </>
            )}
          </motion.section>
        )}

        {/* Stage 3 - Flag */}
        {currentStage >= 3 && (
          <motion.section {...fadeItem} transition={{ duration: 0.3 }}>
            <p className="text-[11px] tracking-[0.22em] text-amber-400 uppercase font-medium tabular-nums mb-2">
              03 · Stage 3 of 4
            </p>
            <h2 className="font-serif font-light text-[28px] md:text-[32px] leading-tight text-slate-100 mb-4">
              Flag
            </h2>
            <p className="text-slate-300 text-[15.5px] leading-relaxed max-w-[600px] mb-6">
              Third check: flag. The Verifier assigns red, amber, or green to every claim from Stage 1, and tags any claim that matches one of the four failure modes you saw in the intro (fabricated source, drifted date, plausible wrong number, framing distortion). The reason field names the specific evidence.
            </p>

            {stage3Status === 'intro' && (
              <PrimaryCTA onClick={runStage3}>Run flag</PrimaryCTA>
            )}

            {stage3Status !== 'intro' && (
              <>
                <StageDivider />
                {stage3.isLoading && flags3.length === 0 && (
                  <p className="text-[12px] text-slate-500 animate-pulse mb-4">Streaming...</p>
                )}
                <div className="space-y-3">
                  {flags3.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        {f?.level && (
                          <span className={`inline-block rounded-full w-3 h-3 shrink-0 mt-1.5 ${levelDot[f.level] ?? 'bg-slate-500'}`} />
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="text-slate-100 text-[15.5px] leading-snug">{f?.claim}</p>
                          {f?.failure_mode && f.failure_mode !== 'none' && (
                            <span className="inline-block text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 mt-1">
                              {failureModeLabel[f.failure_mode] ?? f.failure_mode.replace(/_/g, ' ')}
                            </span>
                          )}
                          {f?.reason && (
                            <p className="text-slate-300 text-[13.5px] mt-1">{f.reason}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {stage3.isLoading && flags3.length > 0 && (
                  <p className="text-[12px] text-slate-500 animate-pulse mt-3">Streaming...</p>
                )}
                {stage3.error && (
                  <p className="text-red-400 text-sm mt-3">
                    Stage 3 failed: {stage3.error.message ?? 'Unknown error'}. Refresh and try again.
                  </p>
                )}
                {stage3Status === 'done' && currentStage === 3 && (
                  <motion.div
                    {...fadeItem}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-6 flex justify-end"
                  >
                    <PrimaryCTA onClick={() => { setCurrentStage(4); }}>Continue</PrimaryCTA>
                  </motion.div>
                )}
              </>
            )}
          </motion.section>
        )}

        {/* Stage 4 - Verdict */}
        {currentStage >= 4 && (
          <motion.section {...fadeItem} transition={{ duration: 0.3 }}>
            <p className="text-[11px] tracking-[0.22em] text-amber-400 uppercase font-medium tabular-nums mb-2">
              04 · Stage 4 of 4
            </p>
            <h2 className="font-serif font-light text-[28px] md:text-[32px] leading-tight text-slate-100 mb-4">
              Verdict
            </h2>
            <p className="text-slate-300 text-[15.5px] leading-relaxed max-w-[600px] mb-6">
              Final step: verdict. The Verifier collapses the three previous stages into a single decision-grade call (red, amber, or green overall), a one-sentence headline you could paste into a Slack message, one specific fix you could make in the next 10 minutes, and an honest note on what it is not fully confident about in its own call.
            </p>

            {stage4Status === 'intro' && (
              <PrimaryCTA onClick={runStage4}>Run verdict</PrimaryCTA>
            )}

            {stage4Status !== 'intro' && (
              <>
                <StageDivider />
                {stage4.isLoading && !verdict4 && (
                  <p className="text-[12px] text-slate-500 animate-pulse mb-4">Streaming...</p>
                )}

                {verdict4 && (
                  <div className="space-y-8">
                    {verdict4?.overall && (
                      <div>
                        <span className={`inline-block text-3xl md:text-4xl font-bold uppercase px-5 py-2 rounded-full ${overallChipBg[verdict4.overall] ?? 'bg-slate-700 text-slate-200'}`}>
                          {verdict4.overall}
                        </span>
                      </div>
                    )}

                    {verdict4?.headline && (
                      <h3 className="font-serif font-light text-[28px] md:text-[32px] leading-tight text-slate-100 max-w-[640px]">
                        {verdict4.headline}
                      </h3>
                    )}

                    {verdict4?.one_fix && (
                      <div>
                        <p className="text-[11px] tracking-[0.22em] text-amber-400 uppercase mb-2">
                          THE ONE FIX
                        </p>
                        <p className="text-slate-200 text-[16px] leading-relaxed max-w-[640px]">
                          {verdict4.one_fix}
                        </p>
                      </div>
                    )}

                    {verdict4?.confidence_note && (
                      <div>
                        <p className="text-[11px] tracking-[0.22em] text-slate-500 uppercase mb-2">
                          CONFIDENCE NOTE
                        </p>
                        <p className="text-slate-400 text-[14.5px] italic leading-relaxed max-w-[640px]">
                          {verdict4.confidence_note}
                        </p>
                      </div>
                    )}

                    {stage4Status === 'done' && (
                      <div>
                        <p className="text-[11px] tracking-[0.22em] text-amber-400 uppercase mb-4">
                          WHAT THIS ARTEFACT TRIGGERED
                        </p>
                        <ul className="space-y-2">
                          {FAILURE_MODES.map((mode) => {
                            const count = failureModeCounts[mode] ?? 0;
                            const encountered = count > 0;
                            return (
                              <li key={mode} className="flex items-center gap-3">
                                {encountered ? (
                                  <>
                                    <span className="text-amber-300 text-[14.5px]">
                                      {failureModeLabel[mode]}
                                    </span>
                                    <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                                      x{count}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-slate-600 text-[14.5px]">
                                    {failureModeLabel[mode]} - not encountered
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {stage4.isLoading && verdict4 && (
                  <p className="text-[12px] text-slate-500 animate-pulse mt-3">Streaming...</p>
                )}
                {stage4.error && (
                  <p className="text-red-400 text-sm mt-3">
                    Stage 4 failed: {stage4.error.message ?? 'Unknown error'}. Refresh and try again.
                  </p>
                )}
                {stage4Status === 'done' && (
                  <motion.div
                    {...fadeItem}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-8 flex justify-end"
                  >
                    <PrimaryCTA onClick={handleAllDone}>Set your thresholds &rarr;</PrimaryCTA>
                  </motion.div>
                )}
              </>
            )}
          </motion.section>
        )}

      </div>
    </ScreenContainer>
  );
}
