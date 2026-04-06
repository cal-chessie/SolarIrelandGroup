#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 2>&1 | tee -a /tmp/next-dev.log
  echo "[$(date)] Server crashed, restarting in 2s..." >> /tmp/next-dev.log
  sleep 2
done
