
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import P from "pino";
import qrcode from "qrcode-terminal";
import "dotenv/config";

const BOT_NAME = "SITANI THE HACKER DEATH";
const VERSION = "3.5.5";
const PREFIX = ".";

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["SITANI BOT", "Chrome", "3.5.5"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("SCAN THIS QR CODE WITH WHATSAPP:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log(`${BOT_NAME} V${VERSION} CONNECTED!`);
    }

    if (connection === "close") {
      const code =
        lastDisconnect?.error?.output?.statusCode;

      if (code !== DisconnectReason.loggedOut) {
        console.log("Reconnecting...");
        startBot();
      } else {
        console.log("Logged out. Please reconnect.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!body.startsWith(PREFIX)) return;

    const command = body
      .slice(PREFIX.length)
      .trim()
      .toLowerCase();

    if (command === "ping") {
      await sock.sendMessage(from, {
        text: "☠️ SITANI BOT IS ONLINE!\nVersion: 3.5.5"
      });
    }

    if (command === "menu") {
      await sock.sendMessage(from, {
        text:
          `☠️ ${BOT_NAME}\n` +
          `Version: ${VERSION}\n\n` +
          `${PREFIX}ping - Check bot status\n` +
          `${PREFIX}menu - Show commands\n` +
          `${PREFIX}about - About the bot`
      });
    }

    if (command === "about") {
      await sock.sendMessage(from, {
        text: `${BOT_NAME}\nVersion ${VERSION}\nCreated with Baileys.`
      });
    }
  });
}

startBot().catch(console.error);
