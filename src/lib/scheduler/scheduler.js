export const Rating = {
  AGAIN: 'again',
  HARD: 'hard',
  GOOD: 'good',
  EASY: 'easy',
};

// Scheduler interface:
// - input: previous state (or null) + rating + now
// - output: next state snapshot (including nextDueAt) + derived flags (leech)
export function createBaselineScheduler() {
  return {
    name: 'baseline-v1',
    schedule({ prevState, rating, now }) {
      const s = prevState
        ? { ...prevState }
        : {
            ease: 2.3,
            intervalDays: 0,
            lapseCount: 0,
            againCount: 0,
            isLeech: false,
          };

      const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
      const dayMs = 24 * 60 * 60 * 1000;

      // Minimal, swap-friendly baseline:
      // - Similar spirit to SM-2 but simplified and with explicit "againCount" for leeches.
      // - Keeps due times at "now + N days" (can be improved later with intra-day steps).
      if (rating === Rating.AGAIN) {
        s.lapseCount += 1;
        s.againCount += 1;
        s.ease = clamp(s.ease - 0.2, 1.3, 2.8);
        s.intervalDays = 0; // immediate relearn; UI will re-queue in-session
      } else if (rating === Rating.HARD) {
        s.ease = clamp(s.ease - 0.05, 1.3, 2.8);
        s.intervalDays = Math.max(1, Math.round(Math.max(1, s.intervalDays) * 1.2));
      } else if (rating === Rating.GOOD) {
        s.intervalDays = Math.max(1, Math.round(Math.max(1, s.intervalDays) * s.ease));
      } else if (rating === Rating.EASY) {
        s.ease = clamp(s.ease + 0.15, 1.3, 2.8);
        s.intervalDays = Math.max(2, Math.round(Math.max(1, s.intervalDays) * (s.ease + 0.2)));
      } else {
        throw new Error(`unknown rating: ${rating}`);
      }

      s.isLeech = s.againCount >= 8;

      const nextDueAt = now + s.intervalDays * dayMs;
      return {
        nextDueAt,
        memory: s,
      };
    },
  };
}

