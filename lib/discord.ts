// lib/discord.ts
import { Client, Intents } from 'discord.js';

let discord: Client;

if (process.env.NODE_ENV === 'production') {
  discord = new Client({ intents: [Intents.FLAGS.GUILDS] });
} else {
  if (!global.discord) {
    global.discord = new Client({ intents: [Intents.FLAGS.GUILDS] });
  }
  discord = global.discord;
}

export default discord;
