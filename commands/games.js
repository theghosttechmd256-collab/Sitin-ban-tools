
const random = (items) =>
  items[Math.floor(Math.random() * items.length)];

export const gamesCommands = {
  dice: async () =>
    `🎲 You rolled ${Math.floor(Math.random() * 6) + 1}`,

  coin: async () =>
    random(["Heads 🪙", "Tails 🪙"]),

  rps: async (args) => {
    const choices = ["rock", "paper", "scissors"];
    const player = args[0]?.toLowerCase();

    if (!choices.includes(player)) {
      return "Use: .rps rock, .rps paper or .rps scissors";
    }

    const bot = random(choices);

    if (player === bot) return `Draw! Both chose ${bot}.`;

    const wins = {
      rock: "scissors",
      paper: "rock",
      scissors: "paper"
    };

    return `You: ${player}\nSITANI: ${bot}\n${
      wins[player] === bot ? "You win! 🎉" : "SITANI wins! ☠️"
    }`;
  },

  number: async () =>
    `🔢 Secret number: ${Math.floor(Math.random() * 100) + 1}`,

  shuffle: async (args) =>
    args.sort(() => Math.random() - 0.5).join(" "),

  pick: async (args) =>
    args.length
      ? `🎯 SITANI picked: ${random(args)}`
      : "Usage: .pick option1 option2 option3"
};
