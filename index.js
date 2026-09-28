const dgram = require("dgram");
const dns = require("dns").promises;

const SERVER_HOST = "mrmuju.progamer.me";
const SERVER_PORT = 19132;

const MAGIC = Buffer.from(
  "00ffff00fefefefefdfdfdfd12345678",
  "hex"
);

async function testRakNet() {
  console.log("=================================");
  console.log("   VANILLA BEDROCK UDP TEST");
  console.log("=================================");
  console.log(`Server: ${SERVER_HOST}:${SERVER_PORT}`);
  console.log("");

  try {
    const address = await dns.lookup(SERVER_HOST, { family: 4 });

    console.log("IPv4:");
    console.log(address.address);
    console.log("");
    console.log("Sending RakNet ping...");

    const socket = dgram.createSocket("udp4");

    const ping = Buffer.alloc(33);

    ping.writeUInt8(0x01, 0);
    ping.writeBigUInt64BE(BigInt(Date.now()), 1);
    MAGIC.copy(ping, 9);

    // Random client GUID
    ping.writeBigUInt64BE(
      BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
      25
    );

    const timeout = setTimeout(() => {
      console.log("");
      console.log("❌ NO RAKNET PONG RECEIVED");
      console.log("Railway did not receive a UDP response from");
      console.log(`${address.address}:${SERVER_PORT}`);
      socket.close();
    }, 10000);

    socket.on("message", (msg, rinfo) => {
      clearTimeout(timeout);

      console.log("");
      console.log("✅ RAKNET RESPONSE RECEIVED!");
      console.log(`From: ${rinfo.address}:${rinfo.port}`);
      console.log(`Packet ID: 0x${msg[0].toString(16).padStart(2, "0")}`);

      if (msg[0] === 0x1c) {
        console.log("✅ VANILLA BEDROCK RAKNET PONG CONFIRMED!");
      } else {
        console.log("⚠️ UDP response received, but it was not an Unconnected Pong.");
      }

      socket.close();
    });

    socket.on("error", (error) => {
      clearTimeout(timeout);
      console.log("");
      console.log("❌ UDP SOCKET ERROR:");
      console.log(error);
      socket.close();
    });

    socket.send(
      ping,
      0,
      ping.length,
      SERVER_PORT,
      address.address,
      (error) => {
        if (error) {
          clearTimeout(timeout);
          console.log("");
          console.log("❌ UDP SEND ERROR:");
          console.log(error);
          socket.close();
        } else {
          console.log("Ping sent successfully.");
          console.log("Waiting up to 10 seconds for Pong...");
        }
      }
    );

  } catch (error) {
    console.log("");
    console.log("❌ DNS ERROR:");
    console.log(error);
  }
}

testRakNet();
