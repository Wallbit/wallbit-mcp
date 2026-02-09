import { api } from "../lib/api";

export const schema = {};

export const metadata = {
  name: "get_stocks_balance",
  description: "Obtiene el balance de stocks del usuario",
};

/**
 * Obtiene el balance de stocks del usuario.
 */
export default async function getStocksBalance() {
  const res = await api.get("/api/public/v1/balance/stocks");
  return JSON.stringify(res.data);
}
