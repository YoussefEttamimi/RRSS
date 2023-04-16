#!/bin/bash
set -e

# Start Nginx
nginx

# Watch for changes in the configuration file and reload Nginx
while true; do
  inotifywait -e modify /etc/nginx/nginx.conf && nginx -s reload
done

exec "$@"
