
export const commands = [
  {
    name: "ping",
    description: "Check bot response",
    category: "GENERAL"
  },
  {
    name: "about",
    description: "Bot information",
    category: "GENERAL"
  },
  {
    name: "time",
    description: "Show current time",
    category: "GENERAL"
  },
  {
    name: "date",
    description: "Show today's date",
    category: "GENERAL"
  },
  {
    name: "joke",
    description: "Get a random joke",
    category: "FUN"
  },
  {
    name: "fact",
    description: "Get a random fact",
    category: "FUN"
  },
  {
    name: "coinflip",
    description: "Flip a virtual coin",
    category: "GAMES"
  },
  {
    name: "roll",
    description: "Roll a six-sided dice",
    category: "GAMES"
  }
];

export function getMenu() {
  const categories = {};

  for (const command of commands) {
    if (!categories[command.category]) {
      categories[command.category] = [];
    }

    categories[command.category].push(command);
  }

  let menu = "☠️ SITANI THE HACKER DEATH ☠️\n";
  menu += "VERSION 3.5.5\n";
  menu += "━━━━━━━━━━━━━━━━━━\n";

  for (const [category, items] of Object.entries(categories)) {
    menu += `\n【 ${category} 】\n`;

    for (const item of items) {
      menu += `.${item.name} - ${item.description}\n`;
    }
  }

  return menu;
}
