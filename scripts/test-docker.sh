#!/bin/bash
set -euo pipefail
pnpm install
pnpm build-ladle
pnpm test-nocontainer
