#!/bin/sh
set -eu

stage="${APP_STAGE:-${NODE_ENV:-production}}"

case "$stage" in
  production|prod|main)
    echo "Starting wallbit-mcp in production mode (compiled output)"
    exec npm run start
    ;;
  development|dev|develop)
    # In container runtime we keep only production deps and dist artifacts.
    # If a dev-capable image is used (with src + dev deps), allow xmcp dev.
    if [ -d "/app/src" ] && [ -x "/app/node_modules/.bin/xmcp" ] && [ -d "/app/node_modules/typescript" ]; then
      echo "Starting wallbit-mcp in development mode (xmcp dev)"
      exec npm run dev
    fi
    echo "Development stage detected but dev assets are not present; falling back to compiled start"
    exec npm run start
    ;;
  *)
    echo "Unknown APP_STAGE/NODE_ENV='$stage'; defaulting to compiled start"
    exec npm run start
    ;;
esac
