import { type Middleware } from "xmcp";

/**
 * Middleware de autenticación para validar tokens de acceso.
 */
const authMiddleware: Middleware = async (req: any, res: any, next: any) => {
  const mcpToken = process.env.API_KEY;

  // Si no hay token configurado, permitir acceso sin autenticación
  if (!mcpToken) {
    await next();
    return;
  }

  const authHeader = req.headers?.authorization;
  const reqToken = authHeader?.split(" ")[1];

  if (!reqToken || reqToken !== mcpToken) {
    throw new Error("Unauthorized: Invalid or missing MCP token");
  }

  await next();
};

export default authMiddleware;
