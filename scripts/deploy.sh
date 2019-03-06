#!/usr/bin/env bash
echo 'Removing package-lock.json'
rm -rf package-lock.json

echo 'Installing npm...'
npm install

echo 'Removing dist...'
rm -rf dist

echo "Copying assets..."
copyfiles -u 1 lib/resources/assets/**/* dist/

echo 'Transpiling to js'
tsc --skipLibCheck