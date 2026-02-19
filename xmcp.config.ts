import { XmcpConfig } from "xmcp";

/**
 * Configuración del servidor XMCP para Wallbit.
 */
const config: XmcpConfig = {
  name: "wallbit-mcp",
  version: "1.0.0",
  http: {
    port: Number(process.env.PORT) || 8080,
    host: "0.0.0.0",  
    endpoint: "/mcp",
    cors: { origin: "*" },
  },
  stdio: true,
  middleware: ["./middleware/auth"],
  paths: {
    prompts: false,
    resources: false,
  },
};

export default config;
