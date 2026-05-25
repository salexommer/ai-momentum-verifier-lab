'use client';

import { useState } from 'react';
import Gate from './components/Gate';

export default function Home() {
  const [passed, setPassed] = useState(false);

  if (!passed) {
    return <Gate onPass={() => setPassed(true)} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="max-w-xl space-y-4 p-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Decision-Grade Verifier</h1>
        <p className="text-sm uppercase tracking-widest text-amber-400">
          Phase 1 scaffold - more lands in Phase 2 onwards
        </p>
        <p className="text-slate-300">
          The scenario picker, stages, lineage view, threshold capture, and downloads
          all land in subsequent build phases.
        </p>
      </div>
    </main>
  );
}
