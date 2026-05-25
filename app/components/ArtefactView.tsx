'use client';

import { useState } from 'react';
import type { Scenario } from '@/lib/scenarios';

type ArtefactViewProps = {
  scenario: Scenario;
  customBody?: string;
  onChangeScenario: () => void;
  onRun: () => void;
};

const COLLAPSE_THRESHOLD = 600;
const PREVIEW_LENGTH = 400;

function trimToLineBreak(text: string, maxLength: number): string {
  const slice = text.slice(0, maxLength);
  const lastNewline = slice.lastIndexOf('\n');
  return lastNewline > 0 ? slice.slice(0, lastNewline) : slice;
}

export default function ArtefactView({
  scenario,
  customBody,
  onChangeScenario,
  onRun,
}: ArtefactViewProps) {
  const [expanded, setExpanded] = useState(false);

  const body = scenario.body ?? customBody ?? '';

  if (!body) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <p className="text-sm text-slate-400">No artefact selected.</p>
        <button
          onClick={onChangeScenario}
          className="text-slate-400 hover:text-slate-200 text-sm"
        >
          Pick a different scenario
        </button>
      </div>
    );
  }

  const isLong = body.length > COLLAPSE_THRESHOLD;
  const displayedBody =
    isLong && !expanded ? trimToLineBreak(body, PREVIEW_LENGTH) : body;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="space-y-2">
        <p className="uppercase tracking-widest text-xs text-amber-400">
          {scenario.stream}
        </p>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-slate-100">
          {scenario.title}
        </h1>
        <p className="text-sm text-slate-400">
          This is the AI output you&apos;re about to verify.
        </p>
      </div>

      <div>
        <pre className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-slate-200 text-sm whitespace-pre-wrap font-mono leading-relaxed">
          {displayedBody}
        </pre>
        {isLong && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-2 text-amber-400 hover:underline text-sm"
          >
            {expanded ? 'Show less' : 'Show full text'}
          </button>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onChangeScenario}
          className="text-slate-400 hover:text-slate-200 text-sm"
        >
          Pick a different scenario
        </button>
        <button
          onClick={onRun}
          className="bg-amber-400 text-slate-950 px-6 py-3 rounded font-semibold hover:bg-amber-300"
        >
          Run the Verifier
        </button>
      </div>
    </div>
  );
}
