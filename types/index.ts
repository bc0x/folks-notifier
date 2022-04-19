/* eslint-disable no-var */

import { PrismaClient } from '@prisma/client';
import { Client as DiscordClient } from 'discord.js';

declare global {
  var prisma: PrismaClient;
  var discord: DiscordClient;
}

export {};
