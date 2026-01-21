import { api } from "../lib/api";

export const schema = {};

export const metadata = {
  name: "get_checking_balance",
  description: "Obtiene el balance de la cuenta checking del usuario",
};

/**
 * Obtiene el balance de la cuenta checking del usuario.
 */
export default async function getCheckingBalance() {
  const res = await api.get("/api/public/v1/balance/checking");
  return JSON.stringify(res.data);
}
