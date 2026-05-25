'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { scenarios, Scenario } from '@/lib/scenarios';

type ScenarioPickerProps = {
  onPick: (scenario: Scenario, customBody?: string) => void;
};

export default function ScenarioPicker({ onPick }: ScenarioPickerProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const seeded = scenarios.slice(0, 6);
  const customScenario = scenarios[6];

  const pastedLength = pastedText.trim().length;
  const isValid = pastedLength >= 100 && pastedLength <= 3000;

  function handleCustomSubmit() {
    if (!isValid) return;
    onPick(customScenario, pastedText.trim());
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {seeded.map((scenario, i) => (
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onPick(scenario)}
          className="bg-slate-900 hover:bg-slate-800 transition rounded-lg p-6 cursor-pointer border border-slate-800 hover:border-amber-400"
        >
          <p className="uppercase tracking-widest text-xs text-amber-400 mb-2">
            {scenario.stream}
          </p>
          <p className="font-serif text-lg font-semibold text-slate-100 leading-snug">
            {scenario.title}
          </p>
          <p className="text-sm text-slate-400 mt-2">{scenario.teaser}</p>
        </motion.div>
      ))}

      <motion.div
        key="custom"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 6 * 0.05 }}
        className="rounded-lg border border-dashed border-amber-400/50 bg-amber-400/5"
      >
        {customOpen ? (
          <div className="p-6 flex flex-col gap-3">
            <textarea
              className="bg-slate-900 border border-slate-700 rounded p-4 w-full min-h-[200px] text-slate-100 placeholder-slate-500 resize-y focus:outline-none focus:border-amber-400 transition"
              placeholder="Paste an AI-generated output you've received this week. 100-3000 characters..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleCustomSubmit}
                disabled={!isValid}
                className="bg-amber-400 text-slate-950 font-semibold px-5 py-2 rounded transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-300 disabled:hover:bg-amber-400"
              >
                Run the Verifier
              </button>
              <button
                onClick={() => {
                  setCustomOpen(false);
                  setPastedText('');
                }}
                className="text-sm text-slate-400 hover:text-slate-200 transition underline underline-offset-2 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            {pastedText.length > 0 && !isValid && (
              <p className="text-xs text-slate-500">
                {pastedLength < 100
                  ? `${100 - pastedLength} more characters needed.`
                  : `${pastedLength - 3000} characters over the 3000 limit.`}
              </p>
            )}
          </div>
        ) : (
          <div
            onClick={() => setCustomOpen(true)}
            className="p-6 cursor-pointer h-full"
          >
            <p className="uppercase tracking-widest text-xs text-amber-400 mb-2">CUSTOM</p>
            <p className="font-serif text-lg font-semibold text-slate-100 leading-snug">
              Paste your own
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Bring an AI output you actually got this week.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
