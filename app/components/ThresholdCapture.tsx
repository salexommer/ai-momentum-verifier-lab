'use client';

type Thresholds = {
  red: string;
  amber: string;
  green: string;
};

type ThresholdCaptureProps = {
  value: Thresholds;
  onChange: (next: Thresholds) => void;
};

type Group = {
  key: keyof Thresholds;
  label: string;
  colorClass: string;
  prompt: string;
  options: string[];
};

const GROUPS: Group[] = [
  {
    key: 'red',
    label: 'Red',
    colorClass: 'text-red-400',
    prompt: 'what does it mean for you on this artefact type?',
    options: ['do not forward', 'rewrite needed', 'stop and escalate'],
  },
  {
    key: 'amber',
    label: 'Amber',
    colorClass: 'text-amber-400',
    prompt: '',
    options: [
      'forward with caveat',
      'forward to one trusted reviewer first',
      'park until I can verify',
    ],
  },
  {
    key: 'green',
    label: 'Green',
    colorClass: 'text-green-400',
    prompt: '',
    options: [
      'forward as is',
      'forward and note it was AI-assisted',
      'always note AI assistance',
    ],
  },
];

export default function ThresholdCapture({ value, onChange }: ThresholdCaptureProps) {
  return (
    <div className="space-y-8 max-w-3xl mx-auto p-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Where do you draw the line?</h2>
        <p className="text-sm text-slate-400 mt-1">
          These thresholds go into both your downloadable Verifier files. You&apos;re saying what
          red/amber/green <em>mean to you</em> for an artefact like this one.
        </p>
      </div>

      {GROUPS.map((group) => (
        <div key={group.key} className="space-y-2">
          <p className="text-sm text-slate-300">
            <span className={`font-bold ${group.colorClass}`}>{group.label}</span>
            {group.prompt ? ` — ${group.prompt}` : '?'}
          </p>

          <div className="space-y-2">
            {group.options.map((option) => {
              const selected = value[group.key] === option;
              return (
                <label
                  key={option}
                  className={`block px-4 py-3 rounded-md border cursor-pointer transition ${
                    selected
                      ? 'border-amber-400 bg-amber-400/10 text-slate-100'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name={group.key}
                    value={option}
                    checked={selected}
                    onChange={() => onChange({ ...value, [group.key]: option })}
                    className="sr-only"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
