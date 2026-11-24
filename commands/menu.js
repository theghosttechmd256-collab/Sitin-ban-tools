
export async function menu(sock, from) {
  const caption = `
╭━━━━━━━━━━━━━━━━━━━━╮
   ☠️ SITANI ☠️
  HACKER DEATH BOT
╰━━━━━━━━━━━━━━━━━━━━╯

👑 OWNER: SITANI
⚡ VERSION: 3.5.5
🟢 STATUS: ONLINE
⚙️ PREFIX: .

━━━━━━━━━━━━━━━━━━━━

📌 GENERAL COMMANDS
┃ .ping
┃ .menu
┃ .about
┃ .owner
┃ .alive
┃ .help

━━━━━━━━━━━━━━━━━━━━

🛠️ TOOLS COMMANDS
┃ .calculator
┃ .weather
┃ .translate
┃ .time
┃ .date

━━━━━━━━━━━━━━━━━━━━

🤖 AI COMMANDS
┃ .ai
┃ .ask
┃ .chat

━━━━━━━━━━━━━━━━━━━━

🎮 FUN & GAMES
┃ .joke
┃ .quote
┃ .riddle
┃ .quiz

━━━━━━━━━━━━━━━━━━━━

👥 GROUP COMMANDS
┃ .groupinfo
┃ .admins
┃ .tagall

━━━━━━━━━━━━━━━━━━━━

☠️ SITANI HACKER DEATH
🔥 VERSION 3.5.5
━━━━━━━━━━━━━━━━━━━━

© SITANI TECH
`;

  await sock.sendMessage(from, {
    text: caption
  });
}
