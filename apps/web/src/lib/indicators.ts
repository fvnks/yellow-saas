export interface ChileanIndicators {
  uf: number;
  dolar: number;
  utm: number;
  euro: number;
  lastUpdated: string;
}

let cachedIndicators: ChileanIndicators | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

export async function getChileanIndicators(): Promise<ChileanIndicators> {
  const now = Date.now();
  if (cachedIndicators && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedIndicators;
  }

  try {
    const res = await fetch("https://findic.cl/api/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });

    if (res.ok) {
      const data = await res.json();
      cachedIndicators = {
        uf: data.uf?.valor || 38500,
        dolar: data.dolar?.valor || 950,
        utm: data.utm?.valor || 66000,
        euro: data.euro?.valor || 1030,
        lastUpdated: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      };
      lastFetchTime = now;
      return cachedIndicators;
    }
  } catch (err) {
    console.warn("Failed to fetch indicators from findic.cl, using fallback", err);
  }

  // Fallback if findic.cl is unreachable
  return {
    uf: 38500,
    dolar: 950,
    utm: 66000,
    euro: 1030,
    lastUpdated: "Fallback",
  };
}