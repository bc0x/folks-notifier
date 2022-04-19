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
import { PrismaClient } from '@prisma/client';

type Data = {
  success: boolean;
  error?: string;
};

const indexerClient = new Indexer(
  'null',
  'https://algoindexer.algoexplorerapi.io',
  ''
);

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | null>
) {
  switch (req.method) {
    case 'GET':
      return await runNotifications(req, res);
    case 'POST':
      return await createNotification(req, res);
    default:
      return res.status(405).send(null);
  }
}

async function createNotification(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
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
      },
    });
  } catch (e) {
    return res
      .status(400)
      .json({ success: false, error: 'Error creating notification.' });
  }
  return res.status(201).json({ success: true });
}

async function runNotifications(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const dbLoans = await prisma.loanNotification.findMany();
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
      // TODO - send text
      console.log('notified');
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
