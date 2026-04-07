#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting production server..." >> /tmp/next-prod.log
  npx next start -p 3000 >> /tmp/next-prod.log 2>&1
  EXIT=$?
  echo "[$(date)] Server exited with code $EXIT, restarting in 2s..." >> /tmp/next-prod.log
  sleep 2
done
