
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import P from "pino";
import qrcode from "qrcode-terminal";
import express from "express";
import "dotenv/config";

import { timingSafeEqual } from "node:crypto";

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

const PORT = Number(process.env.PORT || 3000);
const OWNER_NUMBER = (process.env.OWNER_NUMBER || "").replace(/\D/g, "");
const SESSION_API_KEY = process.env.SESSION_API_KEY || "";

if (!OWNER_NUMBER || !SESSION_API_KEY) {
  console.error("❌ Set OWNER_NUMBER and SESSION_API_KEY in your .env file.");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "10kb" }));

// CORS is for browser access only. API-key authentication is also required.
app.use((req, res, next) => {
  const origin = process.env.PORTAL_ORIGIN;
  if (origin && req.headers.origin === origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-session-api-key");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function authorized(req, res, next) {
  const supplied = req.get("x-session-api-key") || "";
  const a = Buffer.from(supplied);
  const b = Buffer.from(SESSION_API_KEY);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

const commands = {
  ...generalCommands,
  ...toolsCommands,
  ...funCommands,
  ...aiCommands,
  ...gamesCommands,
  ...groupCommands
};

let sock;
let isConnecting = false;
let reconnectTimer;
let latestQR = null;
let lastPairRequest = 0;
let pairingInProgress = false;

app.get("/api/status", authorized, (req, res) => {
  res.json({
    bot: BOT_NAME,
    version: VERSION,
    connected: Boolean(sock?.user),
    registered: Boolean(sock?.authState?.creds?.registered)
  });
});

app.get("/api/qr", authorized, (req, res) => {
  if (!latestQR) {
    return res.status(404).json({
      error: "QR code is not currently available. Try pairing again later."
    });
  }

  res.json({ qr: latestQR });
});

app.post("/api/pair", authorized, async (req, res) => {
  const now = Date.now();

  if (now - lastPairRequest < 30000) {
    return res.status(429).json({
      error: "Please wait before requesting another pairing code."
    });
  }

  if (!sock || sock.user) {
    return res.status(409).json({
      error: "Bot is already connected or still starting."
    });
  }

  if (pairingInProgress) {
    return res.status(409).json({
      error: "A pairing request is already in progress."
    });
  }

  if (sock.authState?.creds?.registered) {
    return res.status(409).json({
      error: "This bot already has a registered session."
    });
  }

  try {
    pairingInProgress = true;
    lastPairRequest = now;

    const code = await sock.requestPairingCode(OWNER_NUMBER);

    res.json({ code });
  } catch (error) {
    console.error("PAIRING ERROR:", error);
    res.status(500).json({
      error: "Could not create pairing code. Check the bot logs."
    });
  } finally {
    pairingInProgress = false;
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`☠️ SITANI API running on port ${PORT}`);
});

async function startBot() {
  if (isConnecting) return;
  isConnecting = true;

  try {
    const { state, saveCreds } =
      await useMultiFileAuthState("./session");

    sock = makeWASocket({
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
        latestQR = qr;
        console.log("\n☠️ SCAN YOUR PRIVATE WHATSAPP QR CODE ☠️\n");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        latestQR = null;
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
        latestQR = null;
        isConnecting = false;

        const status =
          lastDisconnect?.error?.output?.statusCode;

        if (status === DisconnectReason.loggedOut) {
          console.log("❌ Logged out. Remove the old session and reconnect.");
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

          const parts = body.slice(PREFIX.length).trim().split(/\s+/);
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
              text: `☠️ SITANI BOT IS ONLINE!\n\n⚡ STATUS: ACTIVE\n🔥 VERSION: ${VERSION}`
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
            await sock.sendMessage(from, { text: String(result) });
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

console.log(`☠️ STARTING ${BOT_NAME} — VERSION ${VERSION}`);
startBot().catch(console.error);
      
