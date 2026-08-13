# Restyle brief — AegisSync (Live Orders board)

> **New look, same behaviour.** This app is an automated-testing **target** for AegisRunner's
> crawler (and cross-platform / mobile sync tests). You may freely replace the CSS, the HTML, the
> templating, and the framework — but the **HTTP + JSON contract** below must survive unchanged,
> or the tests that run against it break silently.
>
> Note: unlike the other demos this one is **raw `http.createServer`** (zero npm deps), has **no
> login**, and stores orders **in-memory** (a restart clears them). It is a *dual-surface* demo:
> the same order board is placed from a phone and must appear on the web, and vice-versa.

## What this app is (verbatim from `server.js`)
> AegisSync — a tiny dual-surface demo app: ONE backend + ONE shared order
> board, served as responsive web. Used to demonstrate cross-platform sync
> testing: place an order on a phone → it appears on the web (and vice versa).
> Zero npm deps (built-in http). Served under demo.aegisrunner.com/board/ so
> it's reachable from TestingBot's cloud devices AND a desktop browser.

## Preserve EXACTLY (load-bearing)

**HTTP routes** — keep every path + method:
```
GET    /            → the order-board page (HTML)
GET    /healthz     → "ok"
GET    /orders      → JSON array of orders
POST   /orders      → create one order (JSON body)
DELETE /orders      → clear all orders (test reset)
```

**JSON API shape — keep the field names**
- `POST /orders` accepts a JSON body `{ item, qty, via }` (`via` marks the surface, e.g. `"web"` / `"mobile"`) and appends an order with a server-assigned id.
- `GET /orders` returns the full array; each order keeps its **id**, **item**, **qty**, **via**.
- The board page must **render the current orders** and let a user place a new one (the create posts to `POST /orders`).
- `DELETE /orders` clears the board — this is how tests reset state (no `/api/reset` here).

**Responsive** — it must stay usable on a phone viewport (mobile devices drive it in cross-platform tests).

## Free to change
The stylesheet / design system, the HTML markup, the client-side JS (it may become a real framework —
React / Svelte / Vue / htmx — or add real-time push), and how the board looks — provided the server still
answers the routes above with the **same JSON field names (`item`, `qty`, `via`, `id`)**, still serves a
board page at `/`, and still exposes `GET /healthz`.

## Ship
- Keep a `Dockerfile` that builds a container listening on `PORT` and serving `/healthz`.
- Push to this repo's own remote: `https://github.com/Aegis-Runner/demo-sync.git`.

---
_Hand-written (this app is raw `http`, not the Express template); if anything disagrees with the code, the code wins — re-read `server.js`._
