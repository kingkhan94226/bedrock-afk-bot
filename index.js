const dns = require("dns").promises;
const bedrock = require("bedrock-protocol");

const SERVER_HOST = "mrmuju.progamer.me";
const SERVER_PORT = 19132;
const BOT_NAME = "Honey Singh";

async function startBot() {
  console.log("=================================");
  console.log("   Bedrock AFK Bot Starting...");
  console.log("=================================");
  console.log(`Server: ${SERVER_HOST}:${SERVER_PORT}`);
  console.log(`Bot: ${BOT_NAME}`);

  try {
    const address = await dns.lookup(SERVER_HOST, { family: 4 });

    console.log("");
    console.log("IPv4 address found:");
    console.log(address.address);
    console.log("");

    const client = bedrock.createClient({
      host: address.address,
      port: SERVER_PORT,
      username: BOT_NAME,

      offline: false,

      transport: "raknet",
      skipPing: true,

      version: "1.26.51",

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

  } catch (error) {
    console.log("DNS/CONNECTION SETUP ERROR:");
    console.log(error);
  }
}

startBot();
