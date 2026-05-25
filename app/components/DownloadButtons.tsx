'use client';

import { useState } from 'react';

type FailureMode =
  | 'fabricated_source'
  | 'drifted_date'
  | 'plausible_wrong_number'
  | 'framing_distortion';

type DownloadButtonsProps = {
  passcode: string;
  stream: string;
  encounteredModes: FailureMode[];
  thresholds: { red: string; amber: string; green: string };
};

export default function DownloadButtons({
  passcode,
  stream,
  encounteredModes,
  thresholds,
}: DownloadButtonsProps) {
  const [error, setError] = useState<string | null>(null);

  const disabled = !thresholds.red || !thresholds.amber || !thresholds.green;

  async function handleDownload(template: 'langdock' | 'claude') {
    setError(null);
    const res = await fetch(`/api/lab/download?key=${encodeURIComponent(passcode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template,
        stream,
        encountered_modes: encounteredModes,
        thresholds,
      }),
    });
    if (!res.ok) {
      setError(`Download failed: ${res.status}`);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cd = res.headers.get('content-disposition') ?? '';
    const match = cd.match(/filename="?([^"]+)"?/);
    a.download =
      match?.[1] ??
      `decision-grade-verifier-${template === 'langdock' ? 'langdock-skill' : 'claude-agent'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const buttonClass = `px-6 py-4 rounded-lg font-semibold transition text-lg ${
    disabled
      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
      : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
  }`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-6 max-w-3xl mx-auto px-6 sm:px-8 py-4">
        <div className="flex flex-col flex-1">
          <button
            className={buttonClass}
            disabled={disabled}
            onClick={() => handleDownload('langdock')}
          >
            Take this into Langdock
          </button>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[260px]">
            Drop into a Langdock assistant. Run the Verifier on any AI output you paste.
          </p>
        </div>
        <div className="flex flex-col flex-1">
          <button
            className={buttonClass}
            disabled={disabled}
            onClick={() => handleDownload('claude')}
          >
            Take this into Claude
          </button>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[260px]">
            Drop into your <code className="font-mono">.claude/agents/</code> folder. Claude runs the Verifier on demand from your terminal.
          </p>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-6 text-center">
        {disabled
          ? 'Pick a threshold for red, amber, and green to enable downloads.'
          : 'These files are personalised with your stream, encountered failure modes, and thresholds.'}
      </p>
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
    </div>
  );
}
