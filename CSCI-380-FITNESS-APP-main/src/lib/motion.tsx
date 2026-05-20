import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(v => {
        if (mounted) setReduced(!!v);
      })
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', v => setReduced(!!v));
    return () => {
      mounted = false;
      if (sub && typeof (sub as any).remove === 'function') {
        (sub as any).remove();
      }
    };
  }, []);

  // On web, also respect matchMedia when available.
  const webReduced = useMemo(() => {
    if (Platform.OS !== 'web') return null;
    try {
      return typeof window !== 'undefined' && 'matchMedia' in window
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : null;
    } catch {
      return null;
    }
  }, []);

  return webReduced ?? reduced;
}

export function motionDuration(ms: number, reduced: boolean) {
  return reduced ? 0 : ms;
}

