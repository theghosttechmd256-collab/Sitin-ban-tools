
const random = (items) =>
  items[Math.floor(Math.random() * items.length)];

export const funCommands = {
  roast: async (args) => {
    const name = args.join(" ") || "Friend";
    return `${name}, even your Wi-Fi needs a break from you! 😂`;
  },

  compliment: async (args) => {
    const name = args.join(" ") || "Friend";
    return `${name}, keep shining! 🌟`;
  },

  quote: async () => random([
    "Success starts with consistency.",
    "Never stop learning.",
    "Small steps create big achievements.",
    "Your future is built by what you do today."
  ]),

  riddle: async () => random([
    "What has keys but cannot open locks? A piano! 🎹",
    "What gets wetter as it dries? A towel!",
    "What has a face and two hands but no arms? A clock!"
  ]),

  guess: async () => {
    const number = Math.floor(Math.random() * 10) + 1;
    return `🎲 Your secret number is ${number}.`;
  },

  dice: async () => {
    return `🎲 You rolled ${Math.floor(Math.random() * 6) + 1}`;
  },

  eightball: async () => random([
    "Yes! ✅",
    "No! ❌",
    "Maybe! 🤔",
    "Ask again later! ⏳"
  ]),

  rate: async (args) => {
    const subject = args.join(" ") || "You";
    const score = Math.floor(Math.random() * 101);
    return `${subject}: ${score}/100 😂`;
  },

  ship: async (args) => {
    const names = args.join(" + ") || "Unknown";
    return `❤️ ${names}\nCompatibility: ${Math.floor(Math.random() * 101)}%`;
  },

  truth: async () => random([
    "What is your biggest dream?",
    "What skill would you love to learn?",
    "What makes you laugh?"
  ]),

  dare: async () => random([
    "Tell a funny joke!",
    "Say three nice things about a friend!",
    "Share your favourite song title!"
  ])
};
