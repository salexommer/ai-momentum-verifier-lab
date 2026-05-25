'use client';

import { useEffect, useMemo, useState } from 'react';
import Gate from './components/Gate';
import ScenarioPicker from './components/ScenarioPicker';
import ArtefactView from './components/ArtefactView';
import VerifierStages from './components/VerifierStages';
import LineageResult from './components/LineageResult';
import ThresholdCapture from './components/ThresholdCapture';
import DownloadButtons from './components/DownloadButtons';
import type { Scenario, FailureMode } from '@/lib/scenarios';
import type {
  SourceAnchorOutput,
  TriangulateOutput,
  FlagOutput,
  VerdictOutput,
} from '@/app/api/lab/_schemas';

const SESSION_PASSCODE = 'verify';

type LabStage = 'picking' | 'viewing' | 'running' | 'reviewing';

type StageResults = {
  sourceAnchor: SourceAnchorOutput;
  triangulate: TriangulateOutput;
  flag: FlagOutput;
  verdict: VerdictOutput;
};

type Thresholds = {
  red: string;
  amber: string;
  green: string;
};

export default function Home() {
  return (
    <Gate expectedKey={SESSION_PASSCODE}>
      <Lab />
    </Gate>
  );
}

function Lab() {
  const [stage, setStage] = useState<LabStage>('picking');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [customBody, setCustomBody] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<StageResults | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds>({
    red: '',
    amber: '',
    green: '',
  });
  const [passcode, setPasscode] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPasscode(params.get('key') ?? '');
  }, []);

  const encounteredModes = useMemo<FailureMode[]>(() => {
    if (!results) return [];
    const seen = new Set<FailureMode>();
    for (const f of results.flag.flags) {
      if (f.failure_mode !== 'none') seen.add(f.failure_mode);
    }
    return Array.from(seen);
  }, [results]);

  function handlePick(picked: Scenario, body?: string) {
    setScenario(picked);
    setCustomBody(body);
    setStage('viewing');
  }

  function handleChangeScenario() {
    setScenario(null);
    setCustomBody(undefined);
    setResults(null);
    setStage('picking');
  }

  function handleRun() {
    setStage('running');
  }

  function handleAllDone(r: StageResults) {
    setResults(r);
    setStage('reviewing');
  }

  function handleVerifyAnother() {
    setScenario(null);
    setCustomBody(undefined);
    setResults(null);
    setStage('picking');
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      {stage === 'picking' && <ScenarioPicker onPick={handlePick} />}

      {stage === 'viewing' && scenario && (
        <ArtefactView
          scenario={scenario}
          customBody={customBody}
          onChangeScenario={handleChangeScenario}
          onRun={handleRun}
        />
      )}

      {stage === 'running' && scenario && (
        <VerifierStages
          scenario={scenario}
          customBody={customBody}
          passcode={passcode}
          onAllDone={handleAllDone}
        />
      )}

      {stage === 'reviewing' && scenario && results && (
        <div className="space-y-8 pb-16">
          <LineageResult
            sourceAnchor={results.sourceAnchor}
            triangulate={results.triangulate}
            flag={results.flag}
            verdict={results.verdict}
          />
          <ThresholdCapture value={thresholds} onChange={setThresholds} />
          <DownloadButtons
            passcode={passcode}
            stream={scenario.stream}
            encounteredModes={encounteredModes}
            thresholds={thresholds}
          />
          <div className="text-center pb-8">
            <button
              type="button"
              onClick={handleVerifyAnother}
              className="text-sm text-slate-400 hover:text-amber-400 underline-offset-4 hover:underline"
            >
              Verify another one
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-8 py-6 flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-400">
            AI Momentum - Topic 4
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            Decision-Grade Verifier
          </h1>
        </div>
        <p className="hidden sm:block text-xs text-slate-500">
          3 checks. 4 failure modes. 1 verdict.
        </p>
      </div>
    </header>
  );
}
