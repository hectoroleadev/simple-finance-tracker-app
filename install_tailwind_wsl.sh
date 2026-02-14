#!/bin/bash
set -e
export PATH=$HOME/nodejs/bin:$PATH
echo "Environment configured. Node: $(node -v), NPM: $(npm -v)"

echo "Installing Tailwind CSS dependencies..."
npm install -D tailwindcss postcss autoprefixer

echo "Initializing Tailwind configuration..."
npx tailwindcss init -p
