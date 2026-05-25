'use client';

import { useState } from 'react';

type GateProps = {
  onPass: () => void;
};

export default function Gate({ onPass }: GateProps) {
  const [_input, setInput] = useState('');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6 p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Decision-Grade Verifier</h1>
          <p className="text-sm uppercase tracking-widest text-slate-400">AI Momentum - Topic 4</p>
        </div>
        <p className="text-center text-slate-300">
          This is a stub. Real Gate component lands in Phase 3.
        </p>
        <button
          type="button"
          onClick={() => onPass()}
          className="w-full rounded border border-amber-400 px-4 py-2 text-amber-400 hover:bg-amber-400 hover:text-slate-950"
        >
          Enter (stub)
        </button>
      </div>
    </div>
  );
}
