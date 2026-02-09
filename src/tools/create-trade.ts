import { z } from "zod";
import { api } from "../lib/api";

export const schema = {
  symbol: z.string().describe("Símbolo del asset (ej: TSLA, AAPL)"),
  direction: z.string().describe("Dirección del trade: BUY o SELL (en mayúsculas)"),
  order_type: z.string().describe("Tipo de orden: MARKET o LIMIT (en mayúsculas)"),
  amount: z.number().optional().describe("Monto a invertir"),
  shares: z.number().optional().describe("Cantidad de acciones"),
  currency: z.string().default("USD").describe("Moneda del monto (default: USD)"),
};

export const metadata = {
  name: "create_trade",
  description: "Crea una orden de compra o venta de un asset",
};

/**
 * Crea una orden de compra o venta de un asset.
 * @param params - Parámetros del trade
 * @param params.symbol - Símbolo del asset (ej: TSLA, AAPL)
 * @param params.direction - Dirección: BUY o SELL
 * @param params.order_type - Tipo de orden: MARKET o LIMIT
 * @param params.amount - Monto a invertir
 * @param params.shares - Cantidad de acciones
 * @param params.currency - Moneda del monto (default: USD)
 */
export default async function createTrade(params: {
  symbol: string;
  direction: string;
  order_type: string;
  amount?: number;
  shares?: number;
  currency?: string;
}) {
  const res = await api.post("/api/public/v1/trades", params);
  return JSON.stringify(res.data);
}
