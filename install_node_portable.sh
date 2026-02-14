#!/bin/bash
set -e
echo "Starting Node.js installation in home directory..."
cd ~
if [ -d "nodejs" ]; then
    echo "Found existing nodejs directory, cleaning up..."
    rm -rf nodejs
fi
mkdir -p node_install
cd node_install
echo "Downloading Node.js v20.18.0..."
wget -q https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz
echo "Extracting..."
tar -xJf node-v20.18.0-linux-x64.tar.xz
mv node-v20.18.0-linux-x64 ~/nodejs
cd ~
rm -rf node_install
echo "Node.js installed at ~/nodejs"
~/nodejs/bin/node -v
~/nodejs/bin/npm -v
