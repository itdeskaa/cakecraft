"use client";

import { useEffect } from "react";
import { useRegionStore } from "@/lib/region-store";
import type { RegionDTO } from "@/lib/region";

/** Pushes the server-fetched regions into the client store once on mount. */
export function RegionProvider({ regions }: { regions: RegionDTO[] }) {
  const setRegions = useRegionStore((s) => s.setRegions);
  useEffect(() => {
    setRegions(regions);
  }, [regions, setRegions]);
  return null;
}
