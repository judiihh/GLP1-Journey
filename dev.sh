#!/bin/zsh
# Start the dev server even if npm isn't in your PATH yet.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")"

# Stop any existing Next dev servers on common ports
for port in 3000 3001 3002; do
  pid=$(lsof -ti:"$port" 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Stopping process on port $port (pid $pid)..."
    kill "$pid" 2>/dev/null
  fi
done
sleep 1

# Clear stale webpack cache (fixes "Cannot read properties of undefined (reading 'call')")
echo "Clearing .next cache..."
rm -rf .next 2>/dev/null || true
chmod -R u+w .next 2>/dev/null || true
rm -rf .next 2>/dev/null || true

echo "Starting dev server on http://localhost:3000"
npm run dev
