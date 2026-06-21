// React's `cache()` (per-request memoisation) is only available on React 19 /
// canary. We pin React 18.3.1, which doesn't export it, so fall back to an
// identity wrapper. This only loses a small per-request dedup optimisation —
// behaviour is unchanged.
import * as React from "react";

type AnyFn = (...args: any[]) => any;

export const cache: <T extends AnyFn>(fn: T) => T =
  (React as any).cache ?? (<T extends AnyFn>(fn: T) => fn);
