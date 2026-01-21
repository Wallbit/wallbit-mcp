import { z } from "zod";
import { api } from "../lib/api";

export const schema = {
  symbol: z.string().describe("Símbolo del asset (ej: AAPL, BTC)"),
};

export const metadata = {
  name: "get_asset",
  description: "Obtiene información de un asset por su símbolo",
};

/**
 * Obtiene información de un asset por su símbolo.
 */
export default async function getAsset(params: { symbol: string }) {
  const res = await api.get(`/api/public/v1/assets/${params.symbol}`);
  return JSON.stringify(res.data);
}
