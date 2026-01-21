import axios from "axios";

/**
 * Cliente HTTP configurado para la API de Wallbit.
 */
export const api = axios.create({
  baseURL: process.env.BASE_URL || "",
  headers: {
    "X-API-Key": process.env.API_KEY || "",
    "Content-Type": "application/json",
  },
});
