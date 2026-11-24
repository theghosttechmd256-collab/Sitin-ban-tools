
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

let reconnecting = false;

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    browser: ["☠️ SITANI BOT", "Chrome", VERSION]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n☠️ SCAN THIS QR CODE WITH WHATSAPP ☠️\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      reconnecting = false;
      console.log(`
╔════════════════════════════╗
   ☠️ SITANI HACKER DEATH ☠️
       VERSION ${VERSION}
       STATUS: ONLINE
╚════════════════════════════╝
      `);
    }

    if (connection === "close") {
      const status =
        lastDisconnect?.error?.output?.statusCode;

      if (status !== DisconnectReason.loggedOut && !reconnecting) {
        reconnecting = true;
        console.log("Connection lost. Reconnecting...");

        setTimeout(() => {
          reconnecting = false;
          startBot().catch(console.error);
        }, 5000);
      } else if (status === DisconnectReason.loggedOut) {
        console.log("WhatsApp logged out. Scan a new QR code.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const from = msg.key.remoteJid;

      if (!from || from === "status@broadcast") continue;

      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      if (!body.startsWith(PREFIX)) continue;

      const parts = body.slice(1).trim().split(/\s+/);
      const command = parts.shift()?.toLowerCase();
      const args = parts;

      try {
        if (command === "menu") {
          await menu(sock, from);
          continue;
        }

        const handler = commands[command];

        if (!handler) {
          await sock.sendMessage(from, {
            text: `☠️ Unknown command: .${command}\nType .menu to see commands.`
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
        console.error(`Command ${command} failed:`, error);

        await sock.sendMessage(from, {
          text: "⚠️ SITANI BOT encountered an error."
        });
      }
    }
  });
}

console.log(`☠️ Starting ${BOT_NAME} V${VERSION}...`);

startBot().catch(console.error);
            
