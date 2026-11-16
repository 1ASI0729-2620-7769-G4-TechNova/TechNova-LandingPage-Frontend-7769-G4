#!/bin/bash
# Starts the fake REST API (json-server). Works from any working directory (e.g. the repo root on Render).
cd "$(dirname "$0")" || exit 1
npx json-server --watch db.json --routes routes.json --port "${PORT:-3002}" --host 0.0.0.0
