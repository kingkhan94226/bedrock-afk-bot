const bedrock = require("bedrock-protocol");

const SERVER_HOST = "mrmuju.progamer.me";
const SERVER_PORT = 29443;
const BOT_NAME    = "Honey Singh";

console.log("=================================");
console.log("   Bedrock AFK Bot Starting...");
console.log("=================================");
console.log(`Server : ${SERVER_HOST}:${SERVER_PORT}`);
console.log(`Bot    : ${BOT_NAME}`);
console.log(`Transport: NetherNet (WebRTC via Xbox Live)`);

const client = bedrock.createClient({
  host    : SERVER_HOST,
  port    : SERVER_PORT,
  username: BOT_NAME,

  // ─── TRANSPORT ───────────────────────────────────────────────
  // Your server is Bedrock 1.26.51+ which uses NetherNet by default.
  // NetherNet works over WebRTC/TCP — NOT UDP.
  // Setting transport:"raknet" sends UDP which has NO listener → timeout.
  transport: "nethernet",
  nethernet: {
    signalling: "services",   // use Xbox Live cloud signalling (not LAN)
  },
  // ─────────────────────────────────────────────────────────────

  // Microsoft auth is required for NetherNet (Xbox Live signalling needs it)
  offline : false,

  // Version: 1.26.51 is the current default in bedrock-protocol 3.60.1
  // Omit it here and let the library auto-detect from server advertisement
  // (or set it explicitly if auto-detect fails)
  // version: "1.26.51",

  // Give the signalling + WebRTC handshake enough time
  connectTimeout             : 30000,  // 30s for WebRTC transport setup
  // nethernet.signallingConnectTimeout defaults to 15000ms (fine)

  // Microsoft Device Code auth callback
  onMsaCode: (data) => {
    console.log("");
    console.log("========================================");
    console.log("  MICROSOFT LOGIN REQUIRED");
    console.log("========================================");
    console.log("  1. Open this URL in your browser:");
    console.log("    ", data.verification_uri);
    console.log("  2. Enter this code:");
    console.log("    ", data.user_code);
    console.log("========================================");
    console.log("  Waiting for you to complete login...");
    console.log("");
  },
});

client.on("connect", () => {
  console.log("[+] RakNet/NetherNet transport layer connected");
});

client.on("session", () => {
  console.log("[+] Session established (Xbox auth complete)");
});

client.on("join", () => {
  console.log("=================================");
  console.log("✅  BOT JOINED THE SERVER!");
  console.log("=================================");
});

client.on("spawn", () => {
  console.log("✅  BOT SPAWNED IN THE WORLD");
});

client.on("kick", (reason) => {
  console.log("⛔  KICKED:");
  console.log(JSON.stringify(reason, null, 2));
});

client.on("error", (error) => {
  console.log("❌  BOT ERROR:");
  console.log(error.message || error);
});

client.on("close", () => {
  console.log("🔌  CONNECTION CLOSED");
});
