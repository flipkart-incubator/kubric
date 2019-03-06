#!/usr/bin/env bash
set -e

unset TARGET

while getopts 'd:' c
do
  case $c in
    d) TARGET=$OPTARG ;;
  esac
done

TARGET='Users/rajat.g/flipkart/retail/ts-rex_Refactored/ts-rex/node_modules/fk-ballet/dist/'

if [ -n "$TARGET" ]; then
    echo "cleaning build folder..."
    npm run clean

    echo "building project..."
    npm run deploy

    # echo "cleaning target destination..."
    # rm -rf "$TARGET"

    echo "creating destination folder $TARGET..."
    mkdir -p "$TARGET"

    echo "copying build to $TARGET..."
    cp -r './dist/' "$TARGET"

    echo "copy complete."
else
    echo "No destination specified! Tarminating process."
fi

