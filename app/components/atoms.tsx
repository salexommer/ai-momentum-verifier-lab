'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function TopKicker() {
  return (
    <p className="text-[11px] tracking-[0.24em] text-amber-400 uppercase font-medium">
      AI Momentum &middot; Topic 4
    </p>
  );
}

interface PrimaryCTAProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  full?: boolean;
  children: ReactNode;
}

export function PrimaryCTA({
  children,
  onClick,
  disabled,
  full,
  type = 'button',
  ...rest
}: PrimaryCTAProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={
        'bg-amber-400 text-slate-950 text-[15px] font-medium tracking-wide px-6 py-3 transition-colors hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed ' +
        (full ? 'w-full' : '')
      }
      {...rest}
    >
      {children}
    </button>
  );
}

interface PrevLinkProps {
  onClick?: () => void;
  label?: string;
}

export function PrevLink({ onClick, label = 'Back' }: PrevLinkProps) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rv-soft on inline-flex items-center gap-2 text-sm tracking-wide text-slate-400 hover:text-amber-400 transition-colors"
    >
      <span aria-hidden="true" className="text-base">
        &larr;
      </span>
      <span>{label}</span>
    </button>
  );
}

export function ScreenContainer({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div data-screen-label={label} className="w-full px-6 md:px-10 pt-16 md:pt-20 pb-16">
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        {children}
      </div>
    </div>
  );
}

export function CenteredFormScreen({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div data-screen-label={label} className="min-h-[calc(100vh-2rem)] flex items-center justify-center px-6">
      <div className="w-full" style={{ maxWidth: 380 }}>
        {children}
      </div>
    </div>
  );
}
