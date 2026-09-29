'use strict'

const bedrock = require('bedrock-protocol')

// ─── Server & bot configuration ──────────────────────────────────────────────
const HOST = 'mrmuju.progamer.me'
const PORT = 29443
const USERNAME = 'Honey Singh'

// Minecraft Bedrock version the server runs.
// Auto-detection via RakNet ping is impossible because PowerupStack's proxy
// does not return a valid Unconnected Pong (0x1c) to external IPs — this was
// independently confirmed by the RakNet ping test that returned "FAILED".
// Pin this to the actual server version shown in-game or on the panel.
// 1.26.51 is the CURRENT_VERSION in bedrock-protocol 3.60.1.
const VERSION = '1.26.51'

// ─── Reconnect settings ───────────────────────────────────────────────────────
const RECONNECT_BASE_DELAY_MS = 5_000
const RECONNECT_MAX_DELAY_MS = 120_000
let reconnectDelay = RECONNECT_BASE_DELAY_MS
let reconnectTimer = null
let client = null
let shuttingDown = false

// ─── Startup banner ───────────────────────────────────────────────────────────
console.log('=======================================================')
console.log('  Minecraft Bedrock AFK Bot')
console.log('=======================================================')
console.log(`  Bot name  : ${USERNAME}`)
console.log(`  Server    : ${HOST}:${PORT}`)
console.log(`  Version   : ${VERSION}`)
console.log('  Auth      : Microsoft / Xbox Live (online mode)')
console.log('  Transport : RakNet (jsp-raknet, pure JS)')
console.log('  Discovery : skipPing=true (proxy blocks RakNet pings)')
console.log('=======================================================')
console.log('')

// ─── Why these options are set ───────────────────────────────────────────────
//
//  skipPing: true
//    The server is behind PowerupStack's reverse proxy on port 29443.
//    The RakNet "Unconnected Ping" (UDP 0x01) never receives an
//    "Unconnected Pong" (UDP 0x1c) from that proxy — proved by the
//    independent RakNet ping test that returned "RAKNET PING FAILED".
//    Without skipPing, createClient() sends a ping, waits 1 s (default
//    pingTimeout), logs "Server discovery failed", then continues with
//    defaults anyway — so skipping it just removes the useless 1 s wait.
//
//  transport: 'raknet'
//    Explicitly pin RakNet so there is no ambiguity after discovery is
//    skipped. Without this, the fallback chain in createClient.js is
//    `ad?.transport ?? config.transport ?? 'raknet'` — which still lands
//    on RakNet but only by accident. Pinning it is clearer and future-proof.
//
//  version: VERSION
//    With skipPing: true, there is no ping response to extract the protocol
//    number from, so auto-version-detection is disabled. Without an explicit
//    version, createClient falls back to CURRENT_VERSION ('1.26.51').
//    Setting it explicitly documents the intent and prevents a library
//    version bump from silently changing the protocol your bot speaks.
//
//  raknetBackend: 'jsp-raknet'
//    'raknet-native' (the default) is a C++ addon compiled via cmake-js.
//    Railway (and most PaaS environments) do not have CMake installed, so
//    `npm install` fails at the build step. 'jsp-raknet' is pure JavaScript,
//    requires no compiler, and speaks the same protocol.
//    If you later move to an environment where cmake is available (and where
//    you want the extra performance), you can switch back to 'raknet-native'.
//
//  connectTimeout: 15000
//    The default is 9000 ms. Railway → external server UDP has real WAN
//    latency plus the proxy hop. 15 s gives more headroom for the
//    RakNet 3-way handshake (OpenConnectionRequest1/2) to complete without
//    false-positive timeouts on a slow round trip.
//
// ─────────────────────────────────────────────────────────────────────────────

function createBot () {
  if (shuttingDown) return

  console.log('[startup] Creating client and starting authentication...')

  client = bedrock.createClient({
    host: HOST,
    port: PORT,
    username: USERNAME,
    offline: false,

    // ── Critical fixes (see comments above) ──────────────────────────────────
    skipPing: true,               // proxy blocks RakNet pings; skip discovery
    transport: 'raknet',          // explicit RakNet (no accidental NetherNet)
    version: VERSION,             // pin version; no ping = no auto-detection
    raknetBackend: 'jsp-raknet',  // pure-JS backend; no cmake/compiler needed
    connectTimeout: 15_000,       // 15 s; Railway WAN + proxy hop needs room
    // ─────────────────────────────────────────────────────────────────────────

    onMsaCode (data) {
      console.log('')
      console.log('[auth] Microsoft login required.')
      console.log(`[auth] Open this URL  : ${data.verification_uri}`)
      console.log(`[auth] Enter code     : ${data.user_code}`)
      console.log('[auth] Waiting for you to complete sign-in...')
      console.log('')
    }
  })

  // ── Event handlers ──────────────────────────────────────────────────────────

  client.on('connect_allowed', () => {
    // Fired after client.init() completes (i.e. after discovery / skipPing).
    console.log('[connect_allowed] Transport initialised.')
    console.log(`[connect_allowed] Transport  : ${client.options.transport}`)
    console.log(`[connect_allowed] Version    : ${client.options.version}`)
    console.log(`[connect_allowed] Connecting : ${client.options.host}:${client.options.port}`)
  })

  client.on('session', (session) => {
    // Xbox Live / MSA authentication completed (over HTTPS, unrelated to UDP).
    // The RakNet UDP handshake starts NOW, after this event.
    console.log('[session] Microsoft/Xbox authentication complete.')
    console.log('[session] Starting RakNet UDP handshake...')
    if (session && session.profile) {
      console.log(`[session] Gamertag : ${session.profile.name}`)
      console.log(`[session] XUID     : ${session.profile.xuid ?? 'n/a'}`)
    }
  })

  client.on('join', () => {
    // RakNet handshake succeeded + Minecraft login packet exchange complete.
    reconnectDelay = RECONNECT_BASE_DELAY_MS // reset back-off on success
    console.log('[join] Successfully joined the server.')
  })

  client.on('spawn', () => {
    console.log('[spawn] Bot has spawned into the world.')
  })

  client.on('heartbeat', (responseTime) => {
    console.log(`[heartbeat] Server round-trip: ${responseTime} ms`)
  })

  client.on('kick', (reason) => {
    console.error('[kick] Bot was kicked from the server.')
    try {
      const parsed = typeof reason === 'string' ? JSON.parse(reason) : reason
      console.error('[kick] Reason:', JSON.stringify(parsed, null, 2))
    } catch {
      console.error('[kick] Reason:', reason)
    }
  })

  client.on('error', (err) => {
    console.error('[error] Client error:', err.message ?? err)
    if (err.stack) console.error('[error] Stack:\n', err.stack)
  })

  client.on('close', () => {
    console.log('[close] Connection closed.')
    scheduleReconnect()
  })
}

function scheduleReconnect () {
  if (shuttingDown) return
  const delay = reconnectDelay
  reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY_MS)
  console.log(`[reconnect] Reconnecting in ${delay / 1000}s...`)
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    createBot()
  }, delay)
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

function shutdown () {
  if (shuttingDown) return
  shuttingDown = true
  console.log('')
  console.log('[shutdown] Signal received. Closing connection...')
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  try { client?.close() } catch (_) {}
  process.exit(0)
}

// ── Start ─────────────────────────────────────────────────────────────────────
createBot()
