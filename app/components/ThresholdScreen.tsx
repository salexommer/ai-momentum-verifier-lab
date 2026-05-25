'use client';

import { TopKicker, PrimaryCTA, PrevLink, ScreenContainer } from '@/app/components/atoms';
import { useDelayed } from '@/lib/hooks';
import ThresholdCapture from '@/app/components/ThresholdCapture';

type Thresholds = { red: string; amber: string; green: string };

interface ThresholdScreenProps {
  value: Thresholds;
  onChange: (next: Thresholds) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function ThresholdScreen({ value, onChange, onBack, onContinue }: ThresholdScreenProps) {
  const kickerOn = useDelayed(60, []);
  const headOn = useDelayed(210, []);
  const leadOn = useDelayed(360, []);
  const bodyOn = useDelayed(520, []);
  const captureOn = useDelayed(720, []);
  const ctaOn = useDelayed(960, []);

  const allSet = value.red.length > 0 && value.amber.length > 0 && value.green.length > 0;

  return (
    <ScreenContainer label="08 Threshold">
      <div className="mb-6"><PrevLink onClick={onBack} /></div>
      <div className={'rv ' + (kickerOn ? 'on' : '')}><TopKicker /></div>

      <h1 className={'rv mt-5 font-serif font-light text-[40px] md:text-[48px] leading-[1.05] tracking-[-0.01em] text-slate-100 ' + (headOn ? 'on' : '')}>
        Where do you<br />
        <span className="text-slate-300">draw the line?</span>
      </h1>

      <p className={'rv mt-7 text-slate-200 text-[17px] leading-relaxed max-w-[600px] ' + (leadOn ? 'on' : '')}>
        The Verifier just told you what it found. Now you tell it what
        red, amber, and green mean to you on an artefact like this one.
      </p>

      <p className={'rv mt-4 text-slate-400 text-[15.5px] leading-relaxed max-w-[600px] ' + (bodyOn ? 'on' : '')}>
        Your call is personal. It depends on who you&rsquo;re forwarding to
        and how much they trust you. These thresholds get baked into the
        Verifier files you download on the next screen, so the tool
        carries your judgement forward.
      </p>

      <div className={'rv mt-10 ' + (captureOn ? 'on' : '')}>
        <ThresholdCapture value={value} onChange={onChange} />
      </div>

      <div className={'rv-soft mt-12 flex items-center justify-between ' + (ctaOn ? 'on' : '')}>
        <PrevLink onClick={onBack} />
        <PrimaryCTA onClick={onContinue} disabled={!allSet}>
          Get my Verifier files &rarr;
        </PrimaryCTA>
      </div>
    </ScreenContainer>
  );
}
