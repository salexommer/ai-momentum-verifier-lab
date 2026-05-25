'use client';

import { useState } from 'react';
import { TopKicker, PrimaryCTA, CenteredFormScreen } from '@/app/components/atoms';
import { useDelayed } from '@/lib/hooks';

interface NameScreenProps {
  initialValue: string;
  onEnter: (name: string) => void;
}

export default function NameScreen({ initialValue, onEnter }: NameScreenProps) {
  const [v, setV] = useState(initialValue || '');
  const headerOn = useDelayed(80, []);
  const formOn = useDelayed(220, []);
  const enabled = v.trim().length >= 1;

  function submit(e?: React.FormEvent) {
    e?.preventDefault?.();
    if (enabled) onEnter(v.trim());
  }

  return (
    <CenteredFormScreen label="01 Name">
      <form onSubmit={submit} className="w-full">
        <div className={'rv ' + (headerOn ? 'on' : '')}>
          <TopKicker />
          <h1 className="mt-4 font-serif font-light text-[40px] leading-[1.05] tracking-[-0.01em] text-slate-100">
            Decision-Grade Verifier
          </h1>
          <p className="mt-4 text-slate-300 text-[15px] leading-relaxed">
            A short interactive exercise. Let&rsquo;s start with your name.
          </p>
        </div>
        <div className={'rv mt-9 ' + (formOn ? 'on' : '')}>
          <label htmlFor="participantName" className="block text-[12px] tracking-[0.14em] text-slate-400 uppercase mb-3">
            Your name
          </label>
          <input
            id="participantName"
            type="text"
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="First name is fine"
            className="focus-amber w-full bg-transparent border border-slate-700 px-4 py-3 text-slate-100 placeholder-slate-600 text-[15px] focus:outline-none transition-colors"
            autoComplete="given-name"
            autoFocus
          />
          <div className="mt-5">
            <PrimaryCTA full type="submit" disabled={!enabled}>Continue</PrimaryCTA>
          </div>
        </div>
      </form>
    </CenteredFormScreen>
  );
}
