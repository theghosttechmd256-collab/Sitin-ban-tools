
export const generalCommands = {
  ping: async () => {
    return "☠️ SITANI BOT IS ONLINE!";
  },

  about: async () => {
    return "SITANI THE HACKER DEATH\nVersion: 3.5.5";
  },

  time: async () => {
    return new Date().toLocaleTimeString(
      "en-UG",
      { timeZone: "Africa/Kampala" }
    );
  },

  date: async () => {
    return new Date().toLocaleDateString(
      "en-UG",
      { timeZone: "Africa/Kampala" }
    );
  },

  joke: async () => {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "Why did the computer go to the doctor? It caught a virus!",
      "There are 10 types of people: those who understand binary and those who don't."
    ];

    return jokes[Math.floor(Math.random() * jokes.length)];
  },

  fact: async () => {
    const facts = [
      "A day on Venus is longer than its year.",
      "Octopuses have three hearts.",
      "Honey can remain preserved for a very long time."
    ];

    return facts[Math.floor(Math.random() * facts.length)];
  },

  coinflip: async () => {
    return Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙";
  },

  roll: async () => {
    return `🎲 You rolled ${Math.floor(Math.random() * 6) + 1}`;
  }
};
