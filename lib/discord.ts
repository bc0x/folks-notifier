// lib/discord.ts
import { Client } from 'discord.js';

let discord: Client;

if (process.env.NODE_ENV === 'production') {
  discord = new Client();
} else {
  if (!global.discord) {
    global.discord = new Client();
  }
  discord = global.discord;
}

export default discord;
