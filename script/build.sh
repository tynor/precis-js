#!/usr/bin/env bash

set -euo pipefail

tsc --outDir dist/cjs --module commonjs --noEmit false
tsc --outDir dist/mjs --module es2020 --noEmit false
