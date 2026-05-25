'use client';

import { TopKicker, PrimaryCTA, PrevLink, ScreenContainer } from '@/app/components/atoms';
import { useDelayed, useStagger } from '@/lib/hooks';

interface ChecksExplainerScreenProps {
  name: string;
  onBack: () => void;
  onNext: () => void;
}

export default function ChecksExplainerScreen({ name, onBack, onNext }: ChecksExplainerScreenProps) {
  const kickerOn = useDelayed(60, []);
  const headOn   = useDelayed(210, []);
  const leadOn   = useDelayed(360, []);
  const bodyOn   = useDelayed(520, []);
  const listStep = useStagger(3, 720, 160);
  const ctaOn    = useDelayed(1320, []);

  const checks = [
    {
      label: 'SOURCE-ANCHOR',
      kicker: 'Force the AI to expose what it is drawing from. Then check at least one citation actually exists and says what the output claims it says.',
    },
    {
      label: 'TRIANGULATE',
      kicker: 'Re-ask the same question in a second framing: a different time window, cohort, baseline, or tool. Look at the diff, not the agreement.',
    },
    {
      label: 'CONFIDENCE LABEL',
      kicker: 'Red / amber / green per claim, plus one overall verdict. Forces a decision instead of a vague feeling.',
    },
  ];

  return (
    <ScreenContainer label="02 ChecksExplainer">
      <div className="mb-6"><PrevLink onClick={onBack} /></div>
      <div className={'rv ' + (kickerOn ? 'on' : '')}><TopKicker /></div>

      <h1 className={'rv mt-5 font-serif font-light text-[44px] md:text-[52px] leading-[1.05] tracking-[-0.01em] text-slate-100 ' + (headOn ? 'on' : '')}>
        {name ? `Hi, ${name}.` : 'Welcome.'}<br />
        <span className="text-slate-300">Three checks before you forward.</span>
      </h1>

      <p className={'rv mt-7 text-slate-200 text-[17px] leading-relaxed ' + (leadOn ? 'on' : '')} style={{ maxWidth: 600 }}>
        Today you&rsquo;ll run an AI-generated output through a four-stage Verifier.
        The Verifier is built on three checks, applied in turn.
      </p>

      <p className={'rv mt-4 text-slate-400 text-[15.5px] leading-relaxed ' + (bodyOn ? 'on' : '')} style={{ maxWidth: 600 }}>
        After today, you&rsquo;ll be able to run these three checks in your head
        on any AI output. The lab is the trainer wheel. Each check has its own
        muscle.
      </p>

      <ol className="mt-10 space-y-5 list-none">
        {checks.map((s, i) => (
          <li key={s.label} className={'rv ' + (listStep >= i ? 'on' : '')}>
            <div className="relative pl-6 md:pl-7 py-1">
              <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-400" style={{ opacity: 0.4 }}></span>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-[11px] tracking-[0.22em] text-amber-400 uppercase font-medium tabular-nums">
                  {String(i + 1).padStart(2, '0')} &middot; {s.label}
                </span>
              </div>
              <p className="mt-1.5 text-[15.5px] text-slate-300 leading-relaxed" style={{ maxWidth: '560px' }}>
                {s.kicker}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className={'rv-soft mt-12 flex items-center justify-between ' + (ctaOn ? 'on' : '')}>
        <PrevLink onClick={onBack} />
        <PrimaryCTA onClick={onNext}>Next: the four failure modes &rarr;</PrimaryCTA>
      </div>
    </ScreenContainer>
  );
}
