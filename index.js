'use strict'

const bedrock = require('bedrock-protocol')

// ─── Server & bot configuration ───────────────────────────────────────────────
const HOST = 'mrmuju.progamer.me'
const PORT = 29443
const USERNAME = 'Honey Singh'

// ─── Startup banner ───────────────────────────────────────────────────────────
console.log('=======================================================')
console.log('  Minecraft Bedrock AFK Bot')
console.log('=======================================================')
console.log(`  Bot name : ${USERNAME}`)
console.log(`  Server   : ${HOST}:${PORT}`)
console.log('  Auth     : Microsoft / Xbox Live (online mode)')
console.log('  Transport: auto-discovery (RakNet or NetherNet)')
console.log('=======================================================')
console.log('')
console.log('[startup] Initialising client and starting authentication...')

// ─── Create client ────────────────────────────────────────────────────────────
const client = bedrock.createClient({
  host: HOST,
  port: PORT,
  username: USERNAME,
  offline: false,
  onMsaCode (data) {
    console.log('')
    console.log('[auth] Microsoft login required.')
    console.log(`[auth] Open this URL in your browser : ${data.verification_uri}`)
    console.log(`[auth] Enter this code               : ${data.user_code}`)
    console.log('[auth] Waiting for you to complete sign-in...')
    console.log('')
  }
})

// ─── Transport / version resolved ─────────────────────────────────────────────
client.on('connect_allowed', () => {
  console.log('[connect_allowed] Server responded to discovery ping.')
  console.log(`[connect_allowed] Resolved transport : ${client.options.transport ?? 'unknown'}`)
  console.log(`[connect_allowed] Resolved version   : ${client.options.version ?? 'unknown'}`)
  console.log(`[connect_allowed] Connecting to      : ${client.options.host}:${client.options.port}`)
})

// ─── Session established (auth + encryption done) ─────────────────────────────
client.on('session', (session) => {
  console.log('[session] Authentication and encryption complete.')
  if (session && session.profile) {
    console.log(`[session] Xbox Gamertag : ${session.profile.name}`)
    console.log(`[session] XUID          : ${session.profile.xuid ?? 'n/a'}`)
  }
})

// ─── Joined (handshake complete, ready for game packets) ──────────────────────
client.on('join', () => {
  console.log('[join] Successfully joined the server. Game packets active.')
})

// ─── Spawned (chunks received, player is in the world) ────────────────────────
client.on('spawn', () => {
  console.log('[spawn] Bot has spawned into the world. AFK hold active.')
})

// ─── Heartbeat (keep-alive confirmed) ─────────────────────────────────────────
client.on('heartbeat', (responseTime) => {
  console.log(`[heartbeat] Keep-alive confirmed. Server response time: ${responseTime}`)
})

// ─── Kicked ───────────────────────────────────────────────────────────────────
client.on('kick', (reason) => {
  console.error('[kick] Bot was kicked from the server.')
  try {
    const parsed = typeof reason === 'string' ? JSON.parse(reason) : reason
    console.error('[kick] Reason:', JSON.stringify(parsed, null, 2))
  } catch {
    console.error('[kick] Reason:', reason)
  }
})

// ─── Error ────────────────────────────────────────────────────────────────────
client.on('error', (err) => {
  console.error('[error] A client error occurred.')
  console.error('[error] Message:', err.message ?? err)
  if (err.stack) console.error('[error] Stack:\n', err.stack)
})

// ─── Connection closed ────────────────────────────────────────────────────────
client.on('close', () => {
  console.log('[close] Connection to server has been closed.')
})

// ─── Graceful shutdown on SIGINT (Ctrl+C) ─────────────────────────────────────
process.on('SIGINT', () => {
  console.log('')
  console.log('[shutdown] SIGINT received. Closing connection...')
  try {
    client.close()
  } catch (err) {
    // ignore errors during shutdown
  }
  process.exit(0)
})
