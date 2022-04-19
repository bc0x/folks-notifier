// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Indexer } from 'algosdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getLoanInfo,
  TokenPair,
  MainnetOracle,
} from 'folks-finance-js-sdk/src';

type Data = {
  success: boolean;
  error?: string;
};

const indexerClient = new Indexer(
  'null',
  'https://algoindexer.algoexplorerapi.io',
  ''
);

const dbLoans = [
  {
    phone: '+18033788952',
    notifyAt: 10,
    pair: 'ALGO-USDC',
    appId: 686541542,
    collateralPool: {
      appId: 686498781,
      assetId: 0,
      fAssetId: 686505742,
      frAssetId: 686505743,
      assetDecimals: 6,
    },
    borrowPool: {
      appId: 686500029,
      assetId: 31566704,
      fAssetId: 686508050,
      frAssetId: 686508051,
      assetDecimals: 6,
    },
    linkAddr: 'XMW3WFSMMHV54FAP5ROYPB6LUDBUAKSQBZVI2PIX6OR3NWQWBXKUW7KBGY',
    escrowAddress: 'JSGE4T47726R53IZGSXL457DH24CGDFZH52WLT4SOCZMYB5IUM7UJ76MWA',
    userAddress: 'VMBD7IS4GAYKWLK74RM3SQNYC2OHLCULOXMMP4Q5HDKW72OID7V6YSOB7A',
    borrowed: 5,
    collateralBalance: 49.955911,
    borrowBalance: 5.000768,
    borrowBalanceLiquidationThreshold: 29.317918,
    healthFactor: 5.86268309187708,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case 'GET':
      return await runNotifications(req, res);
    case 'POST': {
      console.log('POST worked', req.body);
      return res.status(201).json({ success: true });
    }
    default:
      return res.status(405);
  }
}

async function runNotifications(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // TODO - get loans from DB
  for (const dbLoan of dbLoans) {
    const tokenPair: TokenPair = {
      appId: dbLoan.appId,
      collateralPool: dbLoan.collateralPool,
      borrowPool: dbLoan.borrowPool,
      linkAddr: dbLoan.linkAddr,
    };
    const loanInfo = await getLoanInfo(
      indexerClient,
      tokenPair,
      MainnetOracle,
      dbLoan.escrowAddress
    );
    if (BigIntToNumber(loanInfo.healthFactor, 14) < dbLoan.notifyAt) {
      // TODO - true - notify & update row
      console.log(
        'should notify',
        BigIntToNumber(loanInfo.healthFactor, 14),
        dbLoan.phone
      );
    }
  }
  return res.status(200).json({ success: true });
}

function BigIntToNumber(value: bigint, decimals: number) {
  return Number(value) / (1 * Math.pow(10, decimals));
}
