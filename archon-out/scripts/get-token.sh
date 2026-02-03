#!/bin/bash

# Check if we have a local secret (either exported or in .env.docker)
# We prioritize the file since we are in docker context usually
if [ -f .env.docker ]; then
  # export vars from .env.docker for the node script
  export $(grep -v '^#' .env.docker | xargs)
fi

if [ -n "$JWT_SECRET" ]; then
  # Local generation
  node scripts/generate-token.js
else
  # Remote fallback (placeholder)
  echo "Error: JWT_SECRET not found. Configure .env.docker or set JWT_SECRET." >&2
  exit 1
fi