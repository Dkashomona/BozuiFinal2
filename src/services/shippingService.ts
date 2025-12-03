export type DeliveryMethod = "STANDARD" | "EXPRESS" | "NEXT_DAY";

export type ShippingZone = {
  id: string;
  country: string;
  region?: string;
  zipRange?: [number, number];
  rates: {
    STANDARD: number;
    EXPRESS: number;
    NEXT_DAY: number;
  };
};

export async function getShippingZones(db) {
  const snap = await getDocs(collection(db, "shippingZones"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ShippingZone[];
}

export function findShippingCost(
  zones: ShippingZone[],
  country: string,
  region: string,
  zip: string,
  method: DeliveryMethod
) {
  const numericZip = Number(zip);

  for (const z of zones) {
    if (z.country !== country) continue;
    if (z.region && z.region !== region) continue;
    if (z.zipRange) {
      const [min, max] = z.zipRange;
      if (numericZip < min || numericZip > max) continue;
    }
    return z.rates[method];
  }

  return 0; // default if no match
}
