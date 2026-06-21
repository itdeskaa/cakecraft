import { cache } from "./cache";
import { prisma } from "./prisma";

export type RegionDTO = {
  id: string;
  name: string;
  flag: string | null;
  currency: string;
  currencySymbol: string;
  fxRate: number;
  deliveryFee: number;
  freeDeliveryAbove: number | null;
  isDefault: boolean;
};

function toDTO(r: any): RegionDTO {
  return {
    id: r.id,
    name: r.name,
    flag: r.flag,
    currency: r.currency,
    currencySymbol: r.currencySymbol,
    fxRate: Number(r.fxRate),
    deliveryFee: Number(r.deliveryFee),
    freeDeliveryAbove: r.freeDeliveryAbove != null ? Number(r.freeDeliveryAbove) : null,
    isDefault: r.isDefault,
  };
}

export const getActiveRegions = cache(async (tenantId: string): Promise<RegionDTO[]> => {
  const rows = await prisma.region.findMany({
    where: { tenantId, isActive: true },
    orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }],
  });
  return rows.map(toDTO);
});

export async function getRegionById(tenantId: string, id?: string | null) {
  if (id) {
    const r = await prisma.region.findFirst({ where: { id, tenantId, isActive: true } });
    if (r) return r;
  }
  return prisma.region.findFirst({ where: { tenantId, isActive: true }, orderBy: { isDefault: "desc" } });
}
