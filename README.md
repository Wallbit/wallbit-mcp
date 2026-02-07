# Wallbit MCP

Servidor MCP (Model Context Protocol) para interactuar con la API de Wallbit desde asistentes de IA como Claude y Cursor.

Soporta dos modos de ejecución:

- **Local (stdio)**: Para uso directo con Cursor/Claude Desktop
- **Servidor HTTP (SSE)**: Para deployment en EC2 u otros servidores

## Requisitos

- Node.js 18+
- npm o yarn
- API Key de Wallbit

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Wallbit/wallbit-mcp
cd wallbit-mcp

# Instalar dependencias
npm install

# Compilar el proyecto
npm run build
```

## Variables de Entorno

| Variable   | Descripción                                                 | Requerido |
| ---------- | ----------------------------------------------------------- | --------- |
| `BASE_URL` | URL base de la API de Wallbit                               | Sí        |
| `API_KEY`  | API Key de Wallbit (fallback cuando no se envía por header) | No\*      |
| `PORT`     | Puerto del servidor HTTP (default: 8080)                    | No        |

\* En modo servidor HTTP la API key puede enviarse por header (ver más abajo). En modo stdio (local) es obligatoria por `env`.

## API Key dinámica (modo servidor HTTP)

Cuando el MCP se ejecuta como servidor HTTP, puedes enviar la API key de Wallbit **por petición** en el header, así cada cliente puede usar su propia key sin tocar variables de entorno:

- **Header:** `X-API-Key` (o `x-api-key`)
- **Valor:** Tu API Key de Wallbit

Si no envías este header, el servidor usará la variable de entorno `API_KEY`. Ejemplo de configuración en Cursor contra un MCP remoto:

```json
{
  "mcpServers": {
    "wallbit": {
      "url": "https://mcp.wallbit.com/mcp",
      "headers": {
        "X-API-Key": "your-wallbit-api-key"
      }
    }
  }
}
```

## Modo Local (Cursor/Claude Desktop)

### Uso con Cursor

1. Abre **Settings** → **Cursor Settings** → **MCP**

2. Edita el archivo `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "wallbit": {
      "command": "node",
      "args": ["/ruta/completa/a/wallbit-mcp/dist/stdio.js"],
      "env": {
        "BASE_URL": "https://api.wallbit.io",
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

3. Reinicia Cursor completamente

4. Verifica que el servidor aparezca con indicador verde en la configuración de MCP

### Uso con Claude Desktop

1. Edita el archivo de configuración de Claude Desktop:

   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Agrega la configuración:

```json
{
  "mcpServers": {
    "wallbit": {
      "command": "node",
      "args": ["/ruta/completa/a/wallbit-mcp/dist/stdio.js"],
      "env": {
        "BASE_URL": "https://api.wallbit.io",
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

3. Reinicia Claude Desktop

---

## Modo Servidor (EC2 / Remoto)

### 1. Preparar el servidor EC2

```bash
# Conectar a tu EC2
ssh -i tu-key.pem ec2-user@tu-ip-publica

# Instalar Node.js (Amazon Linux 2)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# O en Ubuntu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar el repositorio
git clone https://github.com/Wallbit/wallbit-mcp
cd wallbit-mcp

# Instalar y compilar
npm install
npm run build
```

### 2. Configurar variables de entorno

Crear archivo `.env` en el directorio del proyecto:

```bash
# Wallbit API
BASE_URL=https://api.wallbit.io
API_KEY=your-api-key

# Server
PORT=8080

# Token de autenticación para clientes MCP (genera uno seguro)
API_KEY=
```

Generar un token seguro:

```bash
openssl rand -hex 32
```

### 3. Ejecutar con PM2 (recomendado para producción)

```bash
# Instalar PM2
sudo npm install -g pm2

# Iniciar el servidor HTTP
pm2 start dist/http.js --name wallbit-mcp

# Ver logs
pm2 logs wallbit-mcp

# Configurar inicio automático
pm2 startup
pm2 save
```

### 4. Configurar Security Group en AWS

Abrir los siguientes puertos inbound:

| Puerto | Protocolo | Fuente    | Descripción              |
| ------ | --------- | --------- | ------------------------ |
| 22     | TCP       | Tu IP     | SSH                      |
| 8080   | TCP       | 0.0.0.0/0 | MCP Server (o usa Nginx) |
| 443    | TCP       | 0.0.0.0/0 | HTTPS (si usas Nginx)    |

### 5. Configurar Nginx con HTTPS (recomendado)

```bash
# Instalar Nginx y Certbot
sudo amazon-linux-extras install nginx1 -y
sudo yum install certbot python3-certbot-nginx -y

# O en Ubuntu
sudo apt install nginx certbot python3-certbot-nginx -y
```

Crear `/etc/nginx/conf.d/wallbit-mcp.conf`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;

        # Configuración importante para SSE
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

```bash
# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 6. Conectar Cursor al servidor remoto

Edita `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "wallbit": {
      "url": "https://tu-dominio.com/sse",
      "headers": {
        "X-API-Key": "your-wallbit-api-key"
      }
    }
  }
}
```

Opcional: si el servidor tiene `API_KEY` en el entorno, no hace falta enviar `X-API-Key` en los headers.

Sin HTTPS (solo para testing):

```json
{
  "mcpServers": {
    "wallbit": {
      "url": "http://your-public-ip:8080/sse",
      "headers": {
        "X-API-Key": "tu-wallbit-api-key"
      }
    }
  }
}
```

### Usando Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/http.js"]
```

```bash
# Compilar imagen
npm run build
docker build -t wallbit-mcp .

# Ejecutar
docker run -d \
  -p 8080:8080 \
  -e BASE_URL=https://api.wallbit.io \
  -e API_KEY=tu-wallbit-api-key \
  --name wallbit-mcp \
  wallbit-mcp
```

---

## Tools Disponibles

### `get_checking_balance`

Obtiene el balance de la cuenta corriente del usuario.

**Parámetros:** Ninguno

**Ejemplo de respuesta:**

```json
{
  "data": [{ "currency": "USD", "balance": "7469.89" }]
}
```

**Ejemplo de uso en chat:**

> "Muéstrame mi balance en Wallbit"

---

### `get_stocks_balance`

Obtiene el balance de la cuenta de inversiones (acciones).

**Parámetros:** Ninguno

**Ejemplo de respuesta:**

```json
{
  "data": [
    { "symbol": "AAPL", "shares": "0.07689051" },
    { "symbol": "TSLA", "shares": "0.00685258" },
    { "symbol": "USD", "shares": "998.61" }
  ]
}
```

**Ejemplo de uso en chat:**

> "¿Qué acciones tengo en mi portafolio?"

---

### `list_transactions`

Lista las transacciones del usuario con soporte para paginación y filtros.

**Parámetros:**

| Nombre   | Tipo   | Requerido | Descripción                         |
| -------- | ------ | --------- | ----------------------------------- |
| `page`   | number | No        | Número de página (default: 1)       |
| `limit`  | number | No        | Resultados por página (default: 10) |
| `status` | string | No        | Filtrar por estado                  |

**Ejemplo de uso en chat:**

> "Muéstrame mis últimas 5 transacciones"

> "¿Cuáles son mis transacciones pendientes?"

---

### `get_asset`

Obtiene información detallada de un asset por su símbolo.

**Parámetros:**

| Nombre   | Tipo   | Requerido | Descripción                             |
| -------- | ------ | --------- | --------------------------------------- |
| `symbol` | string | Sí        | Símbolo del asset (ej: AAPL, TSLA, BTC) |

**Ejemplo de uso en chat:**

> "¿Cuál es el precio actual de AAPL?"

> "Dame información sobre Tesla"

---

### `create_trade`

Crea una orden de compra o venta de un asset.

**Parámetros:**

| Nombre       | Tipo   | Requerido | Descripción                       |
| ------------ | ------ | --------- | --------------------------------- |
| `symbol`     | string | Sí        | Símbolo del asset                 |
| `direction`  | string | Sí        | Dirección: `BUY` o `SELL`         |
| `order_type` | string | Sí        | Tipo de orden: `MARKET` o `LIMIT` |
| `amount`     | number | No        | Monto en USD                      |
| `shares`     | number | No        | Cantidad de acciones              |
| `currency`   | string | Si        | Moneda con la que se opera `USD`  |

**Ejemplo de uso en chat:**

> "Compra $100 de Apple"

> "Vende 0.5 acciones de Tesla"

> "Compra 2 acciones de YPF a precio de mercado"

---

## Ejemplos de Conversación

### Consultar balance completo

```
Usuario: ¿Cuánto dinero tengo en Wallbit?

Asistente: Tienes:
- Cuenta Corriente: $7,469.89 USD
- Cuenta de Inversiones: $998.61 USD en efectivo
- Acciones: AAPL (0.077), TSLA (0.007), YPF (0.30)
```

### Realizar una compra

```
Usuario: Quiero invertir $500 en Apple

Asistente: Voy a crear una orden de compra de $500 en AAPL...
✅ Orden ejecutada exitosamente.
```

### Consultar un asset

```
Usuario: ¿Cómo está Tesla hoy?

Asistente: Tesla (TSLA) está cotizando a $XXX.XX USD
- Cambio diario: +X.XX%
- Volumen: X,XXX,XXX
```

---

## Estructura del Proyecto

```
wallbit-mcp/
├── src/
│   ├── lib/
│   │   └── api.ts            # Cliente HTTP para Wallbit API
│   ├── middleware/
│   │   └── auth.ts           # Middleware de autenticación
│   └── tools/
│       ├── get-checking-balance.ts
│       ├── get-stocks-balance.ts
│       ├── list-transactions.ts
│       ├── get-asset.ts
│       └── create-trade.ts
├── dist/
│   ├── stdio.js              # Entry point para modo local
│   └── http.js               # Entry point para modo servidor
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## Desarrollo

```bash
# Modo desarrollo con hot reload
npm run dev

# Compilar para producción
npm run build

# Ejecutar modo local (stdio)
npm run start:stdio

# Ejecutar modo servidor (HTTP)
npm start
```

## Troubleshooting

### El servidor no responde

- Verifica que las variables de entorno estén configuradas
- Revisa los logs: `pm2 logs wallbit-mcp`

### Error de autenticación

- Verifica que el token en Cursor coincida con `API_KEY`
- El header debe ser `Authorization: Bearer <token>`

### Timeout en SSE

- Asegúrate de que Nginx tenga `proxy_buffering off`
- Verifica que el Security Group permita el tráfico

## Licencia

MIT
