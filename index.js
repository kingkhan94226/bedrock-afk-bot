const bedrock = require("bedrock-protocol");

const SERVER_HOST = "mrmuju.progamer.me";
const SERVER_PORT = 19132;
const BOT_NAME = "Honey Singh";

console.log("=================================");
console.log("   Bedrock AFK Bot Starting...");
console.log("=================================");
console.log(`Server: ${SERVER_HOST}:${SERVER_PORT}`);
console.log(`Bot: ${BOT_NAME}`);

const client = bedrock.createClient({
  host: SERVER_HOST,
  port: SERVER_PORT,
  username: BOT_NAME,

  // Microsoft/Xbox authentication
  offline: false,

  // Use RakNet directly and skip server discovery.
  transport: "raknet",
  skipPing: true,

  // Server is reporting Bedrock 1.26.51.
  version: "1.26.51",

  // Give the connection more time.
  connectTimeout: 20000,

  followPort: false,

  onMsaCode: (data) => {
    console.log("");
    console.log("=================================");
    console.log(" MICROSOFT LOGIN REQUIRED");
    console.log("=================================");
    console.log("Open this URL:");
    console.log(data.verification_uri);
    console.log("");
    console.log("Enter this code:");
    console.log(data.user_code);
    console.log("=================================");
  }
});

client.on("connect", () => {
  console.log("Connected to the Bedrock server.");
});

client.on("login", () => {
  console.log("Login successful.");
});

client.on("join", () => {
  console.log("Bot joined the server!");
});

client.on("spawn", () => {
  console.log("Bot spawned successfully!");
});

client.on("error", (error) => {
  console.log("BOT ERROR:");
  console.log(error);
});

client.on("close", () => {
  console.log("Connection closed.");
});
