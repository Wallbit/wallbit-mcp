import { z } from "zod";
import { api } from "../lib/api";

export const schema = {
  symbol: z.string().describe("Símbolo del asset"),
  direction: z.string().describe("Dirección del trade: buy o sell"),
  orderType: z.string().describe("Tipo de orden: market o limit"),
  amount: z.number().optional().describe("Monto en USD"),
  shares: z.number().optional().describe("Cantidad de acciones"),
};

export const metadata = {
  name: "create_trade",
  description: "Crea una orden de compra o venta de un asset",
};

/**
 * Crea una orden de compra o venta de un asset.
 */
export default async function createTrade(params: {
  symbol: string;
  direction: string;
  orderType: string;
  amount?: number;
  shares?: number;
}) {
  const res = await api.post("/api/public/v1/trades", params);
  return JSON.stringify(res.data);
}
