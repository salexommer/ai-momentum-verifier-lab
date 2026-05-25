'use client';

import Gate from './components/Gate';

const SESSION_PASSCODE = 'verify';

export default function Home() {
  return (
    <Gate expectedKey={SESSION_PASSCODE}>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-xl space-y-4 p-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Decision-Grade Verifier</h1>
          <p className="text-sm uppercase tracking-widest text-amber-400">
            Phase 3 scaffold - state machine lands in Phase 5
          </p>
          <p className="text-slate-300">
            Components are built; the scenario picker, stages, lineage view, threshold capture,
            and downloads wire together in Phase 5.
          </p>
        </div>
      </main>
    </Gate>
  );
}
