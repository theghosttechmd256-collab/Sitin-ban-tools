
export const groupCommands = {
  groupinfo: async (args, sock, msg) => {
    const jid = msg?.key?.remoteJid;

    if (!jid?.endsWith("@g.us")) {
      return "❌ This command only works in groups.";
    }

    const info = await sock.groupMetadata(jid);

    return `☠️ GROUP INFORMATION

Name: ${info.subject}
Members: ${info.participants.length}
Group ID: ${jid}
Created: ${info.creation || "Unknown"}`;
  },

  admins: async (args, sock, msg) => {
    const jid = msg?.key?.remoteJid;

    if (!jid?.endsWith("@g.us")) {
      return "❌ Groups only.";
    }

    const info = await sock.groupMetadata(jid);

    const admins = info.participants
      .filter(user => user.admin)
      .map(user => `@${user.id.split("@")[0]}`);

    return `👑 GROUP ADMINS\n${admins.join("\n") || "No admins found"}`;
  },

  rules: async () => 
    "📜 GROUP RULES\n1. Respect everyone.\n2. No spam.\n3. Follow admin instructions.",

  tagall: async (args, sock, msg) => {
    const jid = msg?.key?.remoteJid;

    if (!jid?.endsWith("@g.us")) {
      return "❌ Groups only.";
    }

    const info = await sock.groupMetadata(jid);

    const mentions = info.participants.map(user => user.id);

    await sock.sendMessage(jid, {
      text: args.join(" ") || "📢 Attention everyone!",
      mentions
    });

    return null;
  }
};
                 
