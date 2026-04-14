#!/bin/bash
# Watchdog - restarts the daemon server if it dies
while true; do
  PID=$(cat /tmp/solar-server.pid 2>/dev/null)
  if [ -z "$PID" ] || ! kill -0 "$PID" 2>/dev/null; then
    echo "[$(date)] Server dead, restarting daemon..." >> /tmp/solar-watchdog.log
    node /home/z/my-project/daemon-server.js >> /tmp/solar-watchdog.log 2>&1
  fi
  sleep 10
done
