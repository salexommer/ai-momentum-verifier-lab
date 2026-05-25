'use client';

import { TopKicker, PrimaryCTA, PrevLink, ScreenContainer } from '@/app/components/atoms';
import { useDelayed, useStagger } from '@/lib/hooks';

interface FailureModesExplainerScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export default function FailureModesExplainerScreen({ onBack, onNext }: FailureModesExplainerScreenProps) {
  const kickerOn = useDelayed(60, []);
  const headOn   = useDelayed(210, []);
  const leadOn   = useDelayed(360, []);
  const bodyOn   = useDelayed(520, []);
  const listStep = useStagger(4, 720, 140);
  const ctaOn    = useDelayed(1420, []);

  const modes = [
    {
      label: 'FABRICATED SOURCE',
      kicker: 'The output cites a doc, URL, or report that does not exist, or one that exists but does not say what the artefact claims.',
    },
    {
      label: 'DRIFTED DATE',
      kicker: 'Data from the wrong period presented as current. AI rarely flags its own staleness.',
    },
    {
      label: 'PLAUSIBLE WRONG NUMBER',
      kicker: 'A math error that reads correctly at a glance. Wrong denominator, wrong base rate, double-counted savings.',
    },
    {
      label: 'FRAMING DISTORTION',
      kicker: 'The numbers are right, but the cherry-picked angle, cohort, or baseline misleads even when the underlying data is accurate.',
    },
  ];

  return (
    <ScreenContainer label="03 FailureModesExplainer">
      <div className="mb-6"><PrevLink onClick={onBack} /></div>
      <div className={'rv ' + (kickerOn ? 'on' : '')}><TopKicker /></div>

      <h1 className={'rv mt-5 font-serif font-light text-[44px] md:text-[52px] leading-[1.05] tracking-[-0.01em] text-slate-100 ' + (headOn ? 'on' : '')}>
        Four ways AI<br />
        <span className="text-slate-300">misleads you.</span>
      </h1>

      <p className={'rv mt-7 text-slate-200 text-[17px] leading-relaxed ' + (leadOn ? 'on' : '')} style={{ maxWidth: 600 }}>
        Hallucinations are not a bug we hope someone else fixes. They&rsquo;re
        a structural property of how generative AI works. Four named patterns
        show up over and over.
      </p>

      <p className={'rv mt-4 text-slate-400 text-[15.5px] leading-relaxed ' + (bodyOn ? 'on' : '')} style={{ maxWidth: 600 }}>
        The Verifier names each one when it surfaces. You&rsquo;ll see them
        tagged in red/amber on Stage 3 of your run. Recognise the pattern
        once, spot it everywhere after.
      </p>

      <ol className="mt-10 space-y-5 list-none">
        {modes.map((s, i) => (
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
        <PrimaryCTA onClick={onNext}>Pick a scenario &rarr;</PrimaryCTA>
      </div>
    </ScreenContainer>
  );
}
