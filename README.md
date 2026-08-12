# aegis-sync

A fictional demo application used as an AegisRunner testing target (no third-party IP).

## What it exercises

```
AegisSync — a tiny dual-surface demo app: ONE backend + ONE shared order
board, served as responsive web. Used to demonstrate cross-platform sync
testing: place an order on a phone → it appears on the web (and vice versa).
Zero npm deps (built-in http). Served under demo.aegisrunner.com/board/ so
it's reachable from TestingBot's cloud devices AND a desktop browser.
```

## Run

```sh
docker build -t demo-sync .
docker run -p 3000:3000 -e DEMO_RESET_TOKEN=changeme demo-sync
```

Fault injection is env-gated via `DEMO_BUGS` (comma-separated); healthy when empty. Reset via `POST /api/reset` with header `X-Reset-Token`.
