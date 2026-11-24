
import { readFile } from "node:fs/promises";

export async function menu(sock, from) {
  const dp = await readFile(
    new URL("../sitani-dp.jpg", import.meta.url)
  );

  const caption = `
☠️ SITANI THE HACKER DEATH ☠️
━━━━━━━━━━━━━━━━━━
⚡ VERSION: 3.5.5
👑 OWNER: SITANI
🟢 STATUS: ONLINE
━━━━━━━━━━━━━━━━━━

📌 GENERAL
.ping
.menu
.about

🛡️ GROUP TOOLS
.groupinfo
.admins

⚙️ UTILITIES
.calculator
.weather

🤖 AI TOOLS
.ai

━━━━━━━━━━━━━━━━━━
☠️ SITANI BOT
800 COMMAND TARGET
━━━━━━━━━━━━━━━━━━
`;

  await sock.sendMessage(from, {
    image: dp,
    caption
  });
}
