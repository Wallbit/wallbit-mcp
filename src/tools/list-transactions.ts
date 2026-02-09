import { z } from "zod";
import { api } from "../lib/api";

export const schema = {
  page: z.number().default(1).describe("Número de página"),
  limit: z.number().default(10).describe("Cantidad de resultados por página"),
  status: z.string().optional().describe("Filtrar por estado"),
};

export const metadata = {
  name: "list_transactions",
  description: "Lista las transacciones del usuario con paginación",
};

/**
 * Lista las transacciones del usuario con paginación.
 */
export default async function listTransactions(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const res = await api.get("/api/public/v1/transactions", { params });
  return JSON.stringify(res.data);
}
