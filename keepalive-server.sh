#!/bin/bash
cd /home/z/my-project
echo "Ensuring production build exists..."
[ -d .next ] || npx next build
while true; do
  echo "Starting PRODUCTION server at $(date)"
  npx next start -p 3000 -H 0.0.0.0 &
  SERVER_PID=$!
  # Keepalive: ping localhost every 5 seconds
  while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 5
    curl -s --max-time 5 http://127.0.0.1:3000/ > /dev/null 2>&1 || true
  done
  echo "Server died at $(date), restarting..."
  sleep 2
done
