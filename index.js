const dns = require("dns").promises;
const bedrock = require("bedrock-protocol");

const SERVER_HOST = "mrmuju.progamer.me";
const SERVER_PORT = 19132;
const BOT_NAME = "Honey Singh";

async function startBot() {
  console.log("=================================");
  console.log("   Bedrock AFK Bot Starting...");
  console.log("=================================");

  const address = await dns.lookup(SERVER_HOST, { family: 4 });

  console.log(`Server IPv4: ${address.address}`);
  console.log(`Port: ${SERVER_PORT}`);
  console.log(`Bot: ${BOT_NAME}`);

  const client = bedrock.createClient({
    host: address.address,
    port: SERVER_PORT,
    username: BOT_NAME,

    offline: false,

    transport: "raknet",
    skipPing: true,

    raknetBackend: "jsp-raknet",
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
}

startBot().catch((error) => {
  console.log("STARTUP ERROR:");
  console.log(error);
});
