import axios from "axios";

/** Nombre del header desde el que se puede enviar la API key de Wallbit de forma dinámica. */
const WALLBIT_API_KEY_HEADER = "x-api-key";

/**
 * Obtiene la API key de Wallbit: primero desde el header de la petición HTTP (modo servidor),
 * y si no está disponible, desde la variable de entorno API_KEY (modo stdio o fallback).
 * @returns La API key a usar para las llamadas a la API de Wallbit.
 */
function getWallbitApiKey(): string {
  try {
    const { headers } = require("xmcp/headers");
    const requestHeaders = headers();
    const key =
      requestHeaders[WALLBIT_API_KEY_HEADER] ??
      requestHeaders["X-API-Key"] ??
      (() => {
        const authHeader = requestHeaders["Authorization"] || requestHeaders["authorization"];
        if (authHeader && typeof authHeader === "string") {
          const match = authHeader.match(/^Bearer\s+(.+)$/i);
          return match ? match[1] : undefined;
        }
        return undefined;
      })();
    if (key) {
      return Array.isArray(key) ? key[0] : key;
    }
  } catch {
    // Sin contexto HTTP (ej. modo stdio); se usa env.
  }
  return process.env.API_KEY ?? "";
}

/**
 * Cliente HTTP configurado para la API de Wallbit.
 * La API key se resuelve por petición: header X-API-Key en HTTP o variable API_KEY en stdio.
 */
export const api = axios.create({
  baseURL: process.env.BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const apiKey = getWallbitApiKey();
  if (apiKey) {
    config.headers.set("X-API-Key", apiKey);
  }
  return config;
});
