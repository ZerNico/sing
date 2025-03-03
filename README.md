# Tune Perfect

## Prerequisites
- [caddy](https://caddyserver.com/docs/install)
- [docker](https://docs.docker.com/get-docker/)
- [bun](https://bun.sh/docs/installation)

## Development

On MacOS add this to your `/etc/hosts`:
```bash
127.0.0.1 tuneperfect.localhost api.tuneperfect.localhost app.tuneperfect.localhost
```

```bash
bun install
docker compose -f docker-compose.dev.yml up -d
caddy start
bun run dev
```