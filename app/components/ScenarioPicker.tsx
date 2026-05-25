'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { scenarios, Scenario } from '@/lib/scenarios';
import { TopKicker, PrimaryCTA, PrevLink, ScreenContainer } from '@/app/components/atoms';
import { useDelayed } from '@/lib/hooks';

type ScenarioPickerProps = {
  onPick: (scenario: Scenario, customBody?: string) => void;
};

export default function ScenarioPicker({ onPick }: ScenarioPickerProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const kickerOn = useDelayed(60);
  const headOn = useDelayed(210);
  const leadOn = useDelayed(360);

  const seeded = scenarios.slice(0, 6);
  const customScenario = scenarios[6];

  const pastedLength = pastedText.trim().length;
  const isValid = pastedLength >= 100 && pastedLength <= 3000;

  function handleCustomSubmit() {
    if (!isValid) return;
    onPick(customScenario, pastedText.trim());
  }

  if (customOpen) {
    return (
      <ScreenContainer label="04 ScenarioPicker">
        <PrevLink
          onClick={() => {
            setCustomOpen(false);
            setPastedText('');
          }}
          label="Back to scenarios"
        />

        <div className="mt-8">
          <h2 className="text-2xl font-serif font-light text-slate-100">
            Paste your AI output.
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            100-3000 characters. The Verifier runs four streamed stages on it.
          </p>

          <textarea
            className="w-full min-h-[260px] bg-slate-900 border border-slate-700 rounded-md p-4 text-slate-100 placeholder-slate-500 text-sm leading-relaxed font-mono focus:border-teal-400 focus:outline-none mt-6 transition-colors resize-y"
            placeholder="Paste an AI-generated output here..."
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />

          <p
            className={
              'text-xs mt-2 ' +
              (pastedText.length > 0 && !isValid ? 'text-red-400' : 'text-slate-500')
            }
          >
            {pastedText.length} / 100-3000 characters
          </p>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleCustomSubmit}
              disabled={!isValid}
              className="bg-teal-400 text-slate-950 text-[15px] font-medium tracking-wide px-6 py-3 transition-colors hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Run the Verifier
            </button>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer label="04 ScenarioPicker">
      <div>
        <div className={`rv ${kickerOn ? 'on' : ''}`}>
          <TopKicker />
        </div>

        <div className={`rv ${headOn ? 'on' : ''} mt-4`}>
          <h1 className="font-serif font-light text-[40px] md:text-[48px] leading-[1.05] tracking-[-0.01em] text-slate-100">
            Pick a scenario.
            <br />
            <span className="text-slate-300">Closest to your work.</span>
          </h1>
        </div>

        <div className={`rv ${leadOn ? 'on' : ''}`}>
          <p className="text-slate-400 text-[15.5px] leading-relaxed mt-6 max-w-[560px]">
            Six AI-generated outputs, one per role family. Pick the one closest to your day, or
            paste your own at the end.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {seeded.map((scenario, i) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            onClick={() => onPick(scenario)}
            className="bg-slate-900 hover:bg-slate-800 transition rounded-lg p-6 cursor-pointer border border-slate-800 hover:border-amber-400/60"
          >
            <p className="uppercase tracking-[0.2em] text-[13px] md:text-sm font-semibold text-amber-400 mb-3">
              {scenario.stream}
            </p>
            <p className="font-serif font-light text-[18px] md:text-[20px] leading-snug text-slate-100">
              {scenario.title}
            </p>
            <p className="text-[14px] text-slate-400 mt-2 leading-relaxed">{scenario.teaser}</p>
          </motion.div>
        ))}

        <motion.div
          key="custom"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + 6 * 0.05 }}
          onClick={() => setCustomOpen(true)}
          className="rounded-lg border-2 border-dashed border-teal-400/60 hover:border-teal-300 bg-teal-400/5 hover:bg-teal-400/10 transition cursor-pointer p-6"
        >
          <p className="uppercase tracking-[0.2em] text-[13px] md:text-sm font-semibold text-teal-300 mb-3">
            {customScenario.stream}
          </p>
          <p className="font-serif font-light text-[18px] md:text-[20px] leading-snug text-slate-100">
            {customScenario.title}
          </p>
          <p className="text-[14px] text-slate-400 mt-2 leading-relaxed">{customScenario.teaser}</p>
        </motion.div>
      </div>
    </ScreenContainer>
  );
}
