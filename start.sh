#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_DIR="$SCRIPT_DIR/backend"
REDIRECTS_FILE="$FRONTEND_DIR/public/_redirects"
ENV_FILE="$FRONTEND_DIR/.env"

# ── 1. Kill old processes ──────────────────────────────────────────────────────
echo "🧹 Cleaning up old processes..."
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "cloudflared"     2>/dev/null || true
sleep 1

# ── 2. Start Spring Boot backend ──────────────────────────────────────────────
echo "🚀 Starting Spring Boot Backend (Port 8080)..."
cd "$BACKEND_DIR"
./mvnw spring-boot:run > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

echo "⏳ Waiting 20 seconds for backend to initialise..."
sleep 20

# ── 3. Start cloudflared and capture tunnel URL ───────────────────────────────
echo "🌐 Starting Cloudflare Tunnel..."
TUNNEL_LOG=$(mktemp)
"$FRONTEND_DIR/cloudflared" tunnel --url http://localhost:8080 > "$TUNNEL_LOG" 2>&1 &
TUNNEL_PID=$!

# Wait up to 30 s for the URL to appear
TUNNEL_URL=""
for i in $(seq 1 30); do
  TUNNEL_URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' "$TUNNEL_LOG" | head -1)
  [ -n "$TUNNEL_URL" ] && break
  sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
  echo "❌ Could not get tunnel URL. Check $TUNNEL_LOG"
  exit 1
fi

echo ""
echo "✅ Tunnel URL: $TUNNEL_URL"

# ── 4. Update frontend/.env ───────────────────────────────────────────────────
echo "📝 Updating .env VITE_API_URL..."
if grep -q "^VITE_API_URL=" "$ENV_FILE"; then
  sed -i "s|^VITE_API_URL=.*|VITE_API_URL=${TUNNEL_URL}|" "$ENV_FILE"
else
  echo "VITE_API_URL=${TUNNEL_URL}" >> "$ENV_FILE"
fi

# ── 5. Update public/_redirects with new tunnel URL ──────────────────────────
echo "📝 Updating public/_redirects proxy rule..."
# Remove old /api/* proxy line, then prepend the new one
grep -v '^/api/\*' "$REDIRECTS_FILE" > "${REDIRECTS_FILE}.tmp" || true
{ echo "/api/* ${TUNNEL_URL}/api/:splat 200"; cat "${REDIRECTS_FILE}.tmp"; } > "$REDIRECTS_FILE"
rm -f "${REDIRECTS_FILE}.tmp"

# ── 6. Rebuild frontend ────────────────────────────────────────────────────────
echo "🏗️  Rebuilding frontend with new API URL..."
cd "$FRONTEND_DIR"
npm run build
cd "$SCRIPT_DIR"

# ── 7. Print deploy instructions ──────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════════"
echo "  🎉 Done! Deploy your frontend to Cloudflare Pages:"
echo ""
echo "  Tunnel URL  : $TUNNEL_URL"
echo "  Dist folder : $FRONTEND_DIR/dist"
echo ""
echo "  ① Push to Git  — Cloudflare Pages auto-deploys"
echo "       OR"
echo "  ② npx wrangler pages deploy frontend/dist --project-name flame-crust-4dw"
echo ""
echo "  Keep this terminal open — tunnel & backend are running."
echo "══════════════════════════════════════════════════════════"

# ── 8. Keep tunnel alive in foreground ────────────────────────────────────────
wait $TUNNEL_PID
