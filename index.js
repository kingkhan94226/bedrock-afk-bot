const bedrock = require("bedrock-protocol");

const SERVER_HOST = "mrmuju.progamer.me";
const SERVER_PORT = 29443;
const BOT_NAME = "Honey Singh";

console.log("=================================");
console.log("   Bedrock AFK Bot Starting...");
console.log("=================================");
console.log(`Server: ${SERVER_HOST}`);
console.log(`Port: ${SERVER_PORT}`);
console.log(`Bot: ${BOT_NAME}`);

const client = bedrock.createClient({
  host: SERVER_HOST,
  port: SERVER_PORT,
  username: BOT_NAME,

  offline: false,

  transport: "raknet",
  skipPing: true,
  
raknetBackend: "raknet-native",
useRaknetWorkers: false,

  version: "1.26.51",

  connectTimeout: 30000,
  followPort: false,

  onMsaCode: (data) => {
    console.log("");
    console.log("MICROSOFT LOGIN REQUIRED");
    console.log("URL:");
    console.log(data.verification_uri);
    console.log("CODE:");
    console.log(data.user_code);
  }
});

client.on("connect", () => {
  console.log("CONNECTED TO RAKNET");
});

client.on("session", () => {
  console.log("SESSION ESTABLISHED");
});

client.on("join", () => {
  console.log("=================================");
  console.log("✅ BOT JOINED THE SERVER!");
  console.log("=================================");
});

client.on("spawn", () => {
  console.log("✅ BOT SPAWNED!");
});

client.on("kick", (reason) => {
  console.log("KICKED:");
  console.log(reason);
});

client.on("error", (error) => {
  console.log("BOT ERROR:");
  console.log(error);
});

client.on("close", () => {
  console.log("CONNECTION CLOSED");
});
