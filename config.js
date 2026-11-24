
export const config = {
  botName: "SITANI THE HACKER DEATH",
  version: "3.5.5",
  prefix: ".",
  ownerNumber: process.env.OWNER_NUMBER || "",
  mode: "public",
  timezone: "Africa/Kampala",

  messages: {
    wait: "⏳ Please wait...",
    success: "✅ Done successfully!",
    error: "❌ Something went wrong.",
    owner: "⛔ This command is for the owner only.",
    admin: "⛔ Group administrators only."
  },

  features: {
    welcome: true,
    antiSpam: true,
    groupModeration: true,
    ai: true,
    stickers: true
  }
};
