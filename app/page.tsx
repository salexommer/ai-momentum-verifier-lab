'use client';

import { useEffect, useMemo, useState } from 'react';
import Gate from './components/Gate';
import NameScreen from './components/NameScreen';
import ChecksExplainerScreen from './components/ChecksExplainerScreen';
import FailureModesExplainerScreen from './components/FailureModesExplainerScreen';
import ScenarioPicker from './components/ScenarioPicker';
import ArtefactView from './components/ArtefactView';
import VerifierStages from './components/VerifierStages';
import LineageResult from './components/LineageResult';
import ThresholdScreen from './components/ThresholdScreen';
import DownloadButtons from './components/DownloadButtons';
import {
  TopKicker,
  PrimaryCTA,
  PrevLink,
  ScreenContainer,
} from '@/app/components/atoms';
import { useDelayed } from '@/lib/hooks';
import type { Scenario, FailureMode } from '@/lib/scenarios';
import type {
  SourceAnchorOutput,
  TriangulateOutput,
  FlagOutput,
  VerdictOutput,
} from '@/app/api/lab/_schemas';

type Screen =
  | 'gated'
  | 'naming'
  | 'checks'
  | 'modes'
  | 'picking'
  | 'viewing'
  | 'running'
  | 'reviewing'
  | 'threshold'
  | 'downloads';

type StageResults = {
  sourceAnchor: SourceAnchorOutput;
  triangulate: TriangulateOutput;
  flag: FlagOutput;
  verdict: VerdictOutput;
};

type Thresholds = { red: string; amber: string; green: string };

export default function Home() {
  const [screen, setScreen] = useState<Screen>('gated');
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [customBody, setCustomBody] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<StageResults | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds>({
    red: '',
    amber: '',
    green: '',
  });
  const [fadeKey, setFadeKey] = useState(0);
  const [crossOn, setCrossOn] = useState(false);

  function go(s: Screen) {
    setScreen(s);
    setFadeKey((k) => k + 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }

  useEffect(() => {
    setCrossOn(false);
    const t = setTimeout(() => setCrossOn(true), 20);
    return () => clearTimeout(t);
  }, [fadeKey]);

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
    go('viewing');
  }

  function handleAllDone(r: StageResults) {
    setResults(r);
    go('reviewing');
  }

  function handleVerifyAnother() {
    setScenario(null);
    setCustomBody(undefined);
    setResults(null);
    go('picking');
  }

  function renderScreen() {
    switch (screen) {
      case 'gated':
        return (
          <Gate
            onPass={(pc) => {
              setPasscode(pc);
              go('naming');
            }}
          />
        );
      case 'naming':
        return (
          <NameScreen
            initialValue={name}
            onEnter={(n) => {
              setName(n);
              go('checks');
            }}
          />
        );
      case 'checks':
        return (
          <ChecksExplainerScreen
            name={name}
            onBack={() => go('naming')}
            onNext={() => go('modes')}
          />
        );
      case 'modes':
        return (
          <FailureModesExplainerScreen
            onBack={() => go('checks')}
            onNext={() => go('picking')}
          />
        );
      case 'picking':
        return <ScenarioPicker onPick={handlePick} />;
      case 'viewing':
        return scenario ? (
          <ArtefactView
            scenario={scenario}
            customBody={customBody}
            onChangeScenario={() => go('picking')}
            onRun={() => go('running')}
          />
        ) : null;
      case 'running':
        return scenario ? (
          <VerifierStages
            scenario={scenario}
            customBody={customBody}
            passcode={passcode}
            onAllDone={handleAllDone}
          />
        ) : null;
      case 'reviewing':
        return results ? (
          <LineageResult
            sourceAnchor={results.sourceAnchor}
            triangulate={results.triangulate}
            flag={results.flag}
            verdict={results.verdict}
            onContinue={() => go('threshold')}
          />
        ) : null;
      case 'threshold':
        return (
          <ThresholdScreen
            value={thresholds}
            onChange={setThresholds}
            onBack={() => go('reviewing')}
            onContinue={() => go('downloads')}
          />
        );
      case 'downloads':
        return scenario && results ? (
          <DownloadsScreen
            stream={scenario.stream}
            encounteredModes={encounteredModes}
            thresholds={thresholds}
            passcode={passcode}
            onVerifyAnother={handleVerifyAnother}
            onBack={() => go('threshold')}
          />
        ) : null;
      default:
        return null;
    }
  }

  const showBadge =
    screen !== 'gated' && screen !== 'naming' && name.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {showBadge && <NameBadge name={name} />}
      <div
        key={fadeKey}
        className={'screen-enter ' + (crossOn ? 'on' : '')}
      >
        {renderScreen()}
      </div>
    </div>
  );
}

function NameBadge({ name }: { name: string }) {
  return (
    <div className="fixed top-4 right-5 z-50 text-[11px] tracking-wide text-slate-500 select-none pointer-events-none">
      <span className="hidden sm:inline">Logged in as </span>
      <span className="text-slate-300">{name}</span>
    </div>
  );
}

function DownloadsScreen({
  stream,
  encounteredModes,
  thresholds,
  passcode,
  onVerifyAnother,
  onBack,
}: {
  stream: string;
  encounteredModes: FailureMode[];
  thresholds: Thresholds;
  passcode: string;
  onVerifyAnother: () => void;
  onBack: () => void;
}) {
  const kickerOn = useDelayed(60, []);
  const headOn = useDelayed(210, []);
  const leadOn = useDelayed(360, []);
  const buttonsOn = useDelayed(560, []);
  const restartOn = useDelayed(900, []);

  return (
    <ScreenContainer label="09 Downloads">
      <div className="mb-6">
        <PrevLink onClick={onBack} />
      </div>
      <div className={'rv ' + (kickerOn ? 'on' : '')}>
        <TopKicker />
      </div>

      <h1
        className={
          'rv mt-5 font-serif font-light text-[40px] md:text-[48px] leading-[1.05] tracking-[-0.01em] text-slate-100 ' +
          (headOn ? 'on' : '')
        }
      >
        Take your<br />
        <span className="text-slate-300">Verifier home.</span>
      </h1>

      <p
        className={
          'rv mt-7 text-slate-200 text-[17px] leading-relaxed max-w-[600px] ' +
          (leadOn ? 'on' : '')
        }
      >
        Two files, same Verifier. Both are personalised with the{' '}
        <strong className="text-amber-300">{stream}</strong> stream you picked,
        the failure modes you encountered, and the thresholds you just set.
      </p>

      <div className={'rv mt-10 ' + (buttonsOn ? 'on' : '')}>
        <DownloadButtons
          passcode={passcode}
          stream={stream}
          encounteredModes={encounteredModes}
          thresholds={thresholds}
        />
      </div>

      <div
        className={
          'rv-soft mt-16 text-center ' + (restartOn ? 'on' : '')
        }
      >
        <button
          type="button"
          onClick={onVerifyAnother}
          className="text-sm text-slate-400 hover:text-amber-400 transition-colors underline-offset-4 hover:underline"
        >
          Verify another scenario
        </button>
      </div>
    </ScreenContainer>
  );
}
