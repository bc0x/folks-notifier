// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import discord from '../../lib/discord';
import { getSession } from 'next-auth/react';
import { Account, LoanNotification, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

type Data = {
  success: boolean;
  error?: string;
  loanNotifications?: LoanNotification[];
  account?:
    | (Account & {
        user: User;
      })
    | null;
};

discord.login(process.env.DISCORD_BOT_TOKEN);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | null>
) {
  switch (req.method) {
    case 'GET':
      return await getNotifications(req, res);
    case 'POST':
      return await createNotification(req, res);
    case 'DELETE': // TODO
    default:
      return res
        .status(405)
        .json({ success: false, error: 'Unsupported Method' });
  }
}

async function createNotification(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getSession({ req });
  if (!session)
    return res.status(401).json({ success: false, error: 'Unautharized' });

  const loanRequest = JSON.parse(req.body);
  try {
    const loanNotification = await prisma.loanNotification.create({
      data: {
        notifyHealthFactor: loanRequest.notifyHealthFactor,
        pair: loanRequest.pair,
        appId: loanRequest.appId,
        collateralPool: loanRequest.collateralPool,
        borrowPool: loanRequest.borrowPool,
        linkAddr: loanRequest.linkAddr,
        escrowAddress: loanRequest.escrowAddress,
        userAddress: loanRequest.userAddress,
        borrowed: loanRequest.borrowed,
        collateralBalance: loanRequest.collateralBalance,
        borrowBalance: loanRequest.borrowBalance,
        borrowBalanceLiquidationThreshold:
          loanRequest.borrowBalanceLiquidationThreshold,
        healthFactor: loanRequest.healthFactor,
        user: { connect: { email: session?.user?.email as string } },
      },
    });
  } catch (e: PrismaClientKnownRequestError | any) {
    return res.status(400).json({
      success: false,
      error: e.message ? e.message : 'Error creating notification.',
    });
  }
  return res.status(201).json({ success: true });
}

async function getNotifications(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getSession({ req });
  if (!session)
    return res.status(401).json({ success: false, error: 'Unautharized' });
  const [loanNotifications, account] = await Promise.all([
    prisma.loanNotification.findMany({
      where: {
        user: { email: session?.user?.email },
      },
    }),
    prisma.account.findFirst({
      where: {
        user: { email: session?.user?.email },
      },
      include: {
        user: true,
      },
    }),
  ]);
  return res.status(200).json({ success: true, loanNotifications, account });
}
