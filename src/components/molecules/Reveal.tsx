import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;
    element.classList.add('reveal-ready');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.classList.remove('reveal-ready');
    };
  }, [reduced]);
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
