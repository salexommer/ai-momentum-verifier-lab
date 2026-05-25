'use client';

import { useEffect, useState, type DependencyList } from 'react';

export function useDelayed(delayMs: number, deps: DependencyList = []): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const t = setTimeout(() => setOn(true), delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return on;
}

export function useStagger(count: number, firstDelay: number, stagger: number): number {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    setStep(-1);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < count; i++) {
      timers.push(
        setTimeout(
          () => setStep((s) => Math.max(s, i)),
          firstDelay + i * stagger,
        ),
      );
    }
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [count, firstDelay, stagger]);
  return step;
}
