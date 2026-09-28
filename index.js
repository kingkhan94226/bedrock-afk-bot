const bedrock = require("bedrock-protocol");

const SERVER_HOST = "mrmuju.progamer.me";
const SERVER_PORT = 29443;

console.log("=================================");
console.log("   BEDROCK RAKNET PING TEST");
console.log("=================================");
console.log(`Server IP: ${SERVER_HOST}`);
console.log(`Port: ${SERVER_PORT}`);
console.log("");

bedrock.ping({
  transport: "raknet",
  host: SERVER_HOST,
  port: SERVER_PORT,
  timeout: 10000
})
.then((result) => {
  console.log("=================================");
  console.log("✅ RAKNET PONG RECEIVED!");
  console.log("=================================");
  console.log("Server name:", result.name);
  console.log("Server version:", result.version);
  console.log("Protocol:", result.protocol);
  console.log("Players:", result.playersOnline, "/", result.playersMax);
  console.log("Raw:", result.raw);
  console.log("");
  console.log("RAKNET CONNECTION IS REACHABLE.");
})
.catch((error) => {
  console.log("=================================");
  console.log("❌ RAKNET PING FAILED");
  console.log("=================================");
  console.log(error);
});
