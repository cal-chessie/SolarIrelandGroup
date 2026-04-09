#!/bin/bash
# Production server with keepalive
cd /home/z/my-project

# Log file
LOG="/tmp/solar-prod.log"
echo "=== Starting production keepalive at $(date) ===" > "$LOG"

while true; do
  echo "[$(date)] Starting next start on port 3000..." >> "$LOG"
  node .next/standalone/server.js 2>>"$LOG" || \
  npx next start -p 3000 -H 0.0.0.0 >>"$LOG" 2>&1
  EXIT=$?
  echo "[$(date)] Server exited with code $EXIT" >> "$LOG"
  sleep 2
done
