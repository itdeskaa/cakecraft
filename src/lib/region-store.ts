"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RegionDTO } from "./region";

type RegionState = {
  regions: RegionDTO[];
  currentId: string | null; // persisted
  hydrated: boolean;
  setRegions: (regions: RegionDTO[]) => void;
  setCurrent: (id: string) => void;
};

export const useRegionStore = create<RegionState>()(
  persist(
    (set, get) => ({
      regions: [],
      currentId: null,
      hydrated: false,
      setRegions: (regions) => {
        const cur = get().currentId;
        const stillValid = cur && regions.some((r) => r.id === cur);
        const fallback = regions.find((r) => r.isDefault)?.id ?? regions[0]?.id ?? null;
        set({ regions, currentId: stillValid ? cur : fallback });
      },
      setCurrent: (id) => set({ currentId: id }),
    }),
    {
      name: "cake-region",
      partialize: (s) => ({ currentId: s.currentId }),
      onRehydrateStorage: () => (state) => state && (state.hydrated = true),
    }
  )
);

export function useCurrentRegion(): RegionDTO | undefined {
  return useRegionStore((s) => s.regions.find((r) => r.id === s.currentId) ?? s.regions[0]);
}

/** Realtime money formatter: converts a BASE-currency amount into the selected region. */
export function useMoney() {
  const region = useCurrentRegion();
  const rate = region?.fxRate ?? 1;
  const symbol = region?.currencySymbol ?? "₹";
  return (base: number | string) => {
    const n = (typeof base === "string" ? parseFloat(base) : base) * rate;
    return `${symbol} ${n.toLocaleString("en-US", {
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };
}
