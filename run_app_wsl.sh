#!/bin/bash
set -e
export PATH=$HOME/nodejs/bin:$PATH
echo "Environment configured. PATH now includes Node.js."
node -v
npm -v

echo "Installing application dependencies..."
npm install
