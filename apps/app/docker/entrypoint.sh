#!/bin/sh

bun --bun /app/node_modules/.bin/import-meta-env -x /app/.env.example -p /usr/share/nginx/html/index.html

nginx -g "daemon off;"