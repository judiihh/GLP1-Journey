#!/bin/zsh
# Start the dev server even if npm isn't in your PATH yet.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")"

# Clear stale webpack cache (fixes "Cannot read properties of undefined (reading 'call')")
rm -rf .next

npm run dev
