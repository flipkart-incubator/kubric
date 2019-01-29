#!/usr/bin/env bash
set -e

echo "Running TSLint..."
tslint 'src/**/*.{ts,tsx}'

echo "Running tsc"
tsc --watch