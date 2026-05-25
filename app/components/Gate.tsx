'use client';

import { useState, useEffect } from 'react';

type GateProps = {
  expectedKey: string;
  children: React.ReactNode;
};

export default function Gate({ expectedKey, children }: GateProps) {
  const [passed, setPassed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get('key');
    setPassed(key === expectedKey);
    setChecked(true);
  }, [expectedKey]);

  if (!checked) {
    return null;
  }

  if (passed) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6 p-8 text-center">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-amber-400">
            AI Momentum - Topic 4
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Decision-Grade Verifier
          </h1>
        </div>
        <p className="text-slate-300">
          Ask your facilitator for the URL with the session passcode.
        </p>
        <p className="text-xs text-slate-500">
          If you're in the lab now, the URL should look like ?key=&lt;word&gt;.
        </p>
      </div>
    </div>
  );
}
