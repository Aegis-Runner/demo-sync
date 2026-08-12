// AegisSync — a tiny dual-surface demo app: ONE backend + ONE shared order
// board, served as responsive web. Used to demonstrate cross-platform sync
// testing: place an order on a phone → it appears on the web (and vice versa).
// Zero npm deps (built-in http). Served under demo.aegisrunner.com/board/ so
// it's reachable from TestingBot's cloud devices AND a desktop browser.
const http = require('http')

const PORT = process.env.PORT || 3000
let orders = [] // in-memory (resets on restart) — fine for a demo
let nextId = 1

const PAGE = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AegisSync — Live Orders</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; background:#0b0f17; color:#e7eaf0; }
  .wrap { max-width: 640px; margin: 0 auto; padding: 20px 16px 60px; }
  h1 { font-size: 22px; margin: 8px 0 2px; }
  .sub { color:#8b94a7; font-size: 13px; margin-bottom: 20px; }
  form { display:flex; gap:8px; margin-bottom: 18px; }
  input, button { font-size: 16px; border-radius: 10px; border:1px solid #2a3344; }
  input { flex:1; background:#131a27; color:#e7eaf0; padding: 12px; }
  input[type=number] { flex: 0 0 88px; }
  button { background:#4f7cff; color:#fff; border:none; padding: 12px 16px; font-weight:600; cursor:pointer; }
  button:active { transform: translateY(1px); }
  ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
  li { background:#131a27; border:1px solid #1f2733; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; }
  .item { font-weight:600; }
  .qty { color:#4f7cff; font-weight:700; }
  .meta { color:#5e6779; font-size:12px; }
  .empty { color:#5e6779; text-align:center; padding: 30px 0; }
  .badge { display:inline-block; background:#1b2a1b; color:#5fd17a; border:1px solid #2c4a2c; font-size:11px; padding:2px 8px; border-radius:999px; }
</style></head>
<body><div class="wrap">
  <h1>AegisSync <span class="badge">live</span></h1>
  <div class="sub">Place an order on any device — it syncs everywhere in real time.</div>
  <form id="f">
    <input id="item" placeholder="Item (e.g. Backpack)" autocomplete="off" required data-testid="order-item" />
    <input id="qty" type="number" min="1" value="1" data-testid="order-qty" />
    <button type="submit" data-testid="place-order">Place order</button>
  </form>
  <ul id="list"><li class="empty">No orders yet.</li></ul>
</div>
<script>
  const list = document.getElementById('list')
  async function load() {
    try {
      const r = await fetch('orders', { cache: 'no-store' })
      const data = await r.json()
      if (!data.length) { list.innerHTML = '<li class="empty">No orders yet.</li>'; return }
      list.innerHTML = data.slice().reverse().map(o =>
        '<li><span class="item">' + esc(o.item) + ' <span class="qty">×' + o.qty + '</span></span>' +
        '<span class="meta">#' + o.id + ' · ' + o.via + '</span></li>'
      ).join('')
    } catch (e) {}
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) }
  document.getElementById('f').addEventListener('submit', async (e) => {
    e.preventDefault()
    const item = document.getElementById('item').value.trim()
    const qty = Number(document.getElementById('qty').value) || 1
    if (!item) return
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
    await fetch('orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ item, qty, via: isMobile ? 'mobile' : 'web' }) })
    document.getElementById('item').value = ''
    document.getElementById('qty').value = '1'
    load()
  })
  load(); setInterval(load, 2000)
</script>
</body></html>`

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(body)
}

const server = http.createServer((req, res) => {
  const path = req.url.replace(/\?.*$/, '').replace(/\/+$/, '') || '/'
  if (req.method === 'GET' && (path === '/' || path === '/index.html')) return send(res, 200, PAGE, 'text/html; charset=utf-8')
  if (req.method === 'GET' && path === '/healthz') return send(res, 200, 'ok', 'text/plain')
  if (req.method === 'GET' && path === '/orders') return send(res, 200, JSON.stringify(orders))
  if (req.method === 'POST' && path === '/orders') {
    let b = ''
    req.on('data', c => (b += c))
    req.on('end', () => {
      let o; try { o = JSON.parse(b || '{}') } catch { o = {} }
      const order = { id: nextId++, item: String(o.item || 'Item').slice(0, 60), qty: Math.max(1, Number(o.qty) || 1), via: o.via === 'mobile' ? 'mobile' : 'web', ts: Date.now() }
      orders.push(order)
      send(res, 201, JSON.stringify(order))
    })
    return
  }
  if (req.method === 'DELETE' && path === '/orders') { orders = []; nextId = 1; return send(res, 200, '{"ok":true}') }
  send(res, 404, '{"error":"not found"}')
})
server.listen(PORT, () => console.log('[aegis-sync] listening on :' + PORT))
