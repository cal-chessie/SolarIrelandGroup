#!/bin/bash
cd /home/z/my-project

LOG="/tmp/solar-prod.log"
echo "=== $(date) Starting production server ===" > "$LOG"

# Run next start directly - this script must stay alive to keep the server alive
exec npx next start -p 3000 -H 0.0.0.0 >>"$LOG" 2>&1
