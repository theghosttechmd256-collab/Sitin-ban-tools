
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import P from "pino";
import qrcode from "qrcode-terminal";
import "dotenv/config";

import { generalCommands } from "./commands/general.js";
import { toolsCommands } from "./commands/tools.js";
import { funCommands } from "./commands/fun.js";
import { aiCommands } from "./commands/ai.js";
import { gamesCommands } from "./commands/games.js";
import { groupCommands } from "./commands/group.js";
import { menu } from "./commands/menu.js";

const BOT_NAME = "☠️『SITANI』亗 HACKER DEATH 亗";
const VERSION = "3.5.5";
const PREFIX = ".";

const commands = {
  ...generalCommands,
  ...toolsCommands,
  ...funCommands,
  ...aiCommands,
  ...gamesCommands,
  ...groupCommands
};

let isConnecting = false;
let reconnectTimer;

async function startBot() {
  if (isConnecting) return;
  isConnecting = true;

  try {
    const { state, saveCreds } =
      await useMultiFileAuthState("./session");

    const sock = makeWASocket({
      auth: state,
      logger: P({ level: "silent" }),
      browser: ["SITANI BOT", "Chrome", VERSION],
      printQRInTerminal: false,
      markOnlineOnConnect: true,
      syncFullHistory: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("\n☠️ SCAN YOUR WHATSAPP QR CODE ☠️\n");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        isConnecting = false;

        console.log(`
╔════════════════════════════════╗
    ☠️ SITANI HACKER DEATH ☠️
    VERSION: ${VERSION}
    STATUS: ONLINE 🟢
    PREFIX: ${PREFIX}
╚════════════════════════════════╝
        `);
      }

      if (connection === "close") {
        isConnecting = false;

        const status =
          lastDisconnect?.error?.output?.statusCode;

        if (status === DisconnectReason.loggedOut) {
          console.log("❌ Logged out. Please connect again.");
          return;
        }

        console.log("⚠️ Connection lost.");

        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            startBot().catch(console.error);
          }, 5000);
        }
      }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
      for (const msg of messages) {
        try {
          if (!msg.message || msg.key.fromMe) continue;

          const from = msg.key.remoteJid;

          if (!from || from === "status@broadcast") continue;

          const body =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            "";

          if (!body.startsWith(PREFIX)) continue;

          const parts = body.slice(PREFIX.length)
            .trim()
            .split(/\s+/);

          const command = parts.shift()?.toLowerCase();
          const args = parts;

          if (!command) continue;

          console.log(`☠️ COMMAND: ${command}`);

          if (command === "menu") {
            await menu(sock, from);
            continue;
          }

          if (command === "ping") {
            await sock.sendMessage(from, {
              text: "☠️ SITANI BOT IS ONLINE!\n\n⚡ STATUS: ACTIVE\n🔥 VERSION: " + VERSION
            });
            continue;
          }

          const handler = commands[command];

          if (!handler) {
            await sock.sendMessage(from, {
              text: `❌ Unknown command: ${PREFIX}${command}\n\nType .menu to see commands.`
            });
            continue;
          }

          const result = await handler(args, sock, msg);

          if (result !== null && result !== undefined) {
            await sock.sendMessage(from, {
              text: String(result)
            });
          }

        } catch (error) {
          console.error("MESSAGE ERROR:", error);
        }
      }
    });

  } catch (error) {
    isConnecting = false;
    console.error("BOT START ERROR:", error);

    setTimeout(() => {
      startBot().catch(console.error);
    }, 5000);
  }
}

console.log(`
☠️ STARTING ${BOT_NAME}
🔥 VERSION: ${VERSION}
`);

startBot().catch(console.error);
          
