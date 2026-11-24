
export const toolsCommands = {
  calculator: async (args) => {
    const expression = args.join("");

    if (!/^[0-9+\-*/().% ]+$/.test(expression)) {
      return "❌ Invalid calculation.";
    }

    try {
      const result = Function(
        `"use strict"; return (${expression})`
      )();

      if (!Number.isFinite(result)) {
        return "❌ Invalid result.";
      }

      return `🧮 RESULT: ${result}`;
    } catch {
      return "❌ Calculation error.";
    }
  },

  reverse: async (args) => {
    return args.join(" ").split("").reverse().join("");
  },

  uppercase: async (args) => {
    return args.join(" ").toUpperCase();
  },

  lowercase: async (args) => {
    return args.join(" ").toLowerCase();
  },

  count: async (args) => {
    const text = args.join(" ");

    return `Characters: ${text.length}\nWords: ${text.trim() ? text.trim().split(/\s+/).length : 0}`;
  },

  binary: async (args) => {
    return args.join(" ")
      .split("")
      .map(char => char.charCodeAt(0).toString(2))
      .join(" ");
  },

  unbinary: async (args) => {
    const binary = args.join(" ").trim();

    if (!/^[01]+(?:\s+[01]+)*$/.test(binary)) {
      return "❌ Invalid binary text.";
    }

    return binary.split(/\s+/)
      .map(value => String.fromCharCode(parseInt(value, 2)))
      .join("");
  }
};
