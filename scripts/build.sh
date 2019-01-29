#!/usr/bin/env bash
set -e

echo "Copying assets..."
copyfiles -u 1 lib/core/resources/assets/**/* dist/

echo "Running TSLint..."
tslint 'src/**/*.{ts,tsx}'

echo "Running tsc"
tsc --watch