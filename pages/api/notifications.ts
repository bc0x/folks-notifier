// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Indexer } from 'algosdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getLoanInfo,
  TokenPair,
  MainnetOracle,
  Pool,
} from 'folks-finance-js-sdk/src';
import { BigIntToNumber } from '../../lib/helpers';
import prisma from '../../lib/prisma';
import discord from '../../lib/discord';
import { getSession } from 'next-auth/react';
import { Account, LoanNotification, User } from '@prisma/client';

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

const indexerClient = new Indexer(
  'null',
  'https://algoindexer.algoexplorerapi.io',
  ''
);

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
    case 'OTHER':
      return await triggerNotifications(req, res);
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
        phone: loanRequest.phone,
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
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, error: 'Error creating notification.' });
  }
  return res.status(201).json({ success: true });
}

async function triggerNotifications(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // TODO -- Auth Header
  const dbLoans = await prisma.loanNotification.findMany({
    include: {
      user: true,
    },
  });
  for (const dbLoan of dbLoans) {
    const tokenPair: TokenPair = {
      appId: dbLoan.appId,
      collateralPool: dbLoan.collateralPool as unknown as Pool,
      borrowPool: dbLoan.borrowPool as unknown as Pool,
      linkAddr: dbLoan.linkAddr,
    };
    const loanInfo = await getLoanInfo(
      indexerClient,
      tokenPair,
      MainnetOracle,
      dbLoan.escrowAddress
    );
    var shouldNotifyDate = new Date();
    shouldNotifyDate.setDate(shouldNotifyDate.getDate() - 1);
    if (
      BigIntToNumber(loanInfo.healthFactor, 14) < dbLoan.notifyHealthFactor &&
      (dbLoan.notifiedAt === null || dbLoan?.notifiedAt < shouldNotifyDate)
    ) {
      const account = await prisma.account.findFirst({
        where: {
          user: { id: dbLoan.user.id },
        },
      });
      const user = await discord.users.fetch(
        account?.providerAccountId as string
      );
      const msg = `Hey there, you're at risk of getting liquidated: ${
        dbLoan.pair
      } health at ${BigIntToNumber(loanInfo.healthFactor, 14)}`;
      user.send(msg).catch((e) => console.log(e));
      await prisma.loanNotification.update({
        where: {
          id: dbLoan.id,
        },
        data: {
          notifiedAt: new Date().toISOString(),
        },
      });
    }
  }
  return res.status(200).json({ success: true });
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
