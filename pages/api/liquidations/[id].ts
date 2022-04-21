// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  MainnetTokenPairs,
  getLoanInfo,
  TokenPair,
  MainnetOracle,
  MainnetTokenPairKey,
  TokenPairInfo,
} from 'folks-finance-js-sdk/src';
import { BigIntToNumber } from '../../../lib/helpers';
import indexer from '../../../lib/indexer';
import { Liquidation } from '@prisma/client';

type Data = {
  liquidations?: any[];
  success?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | null>
) {
  switch (req.method) {
    case 'GET':
      return await getLiquidations(req, res);
    default: {
      return res.status(405).send(null);
    }
  }
}

async function getLiquidations(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;
  let liquidations: Liquidation[];
  if (id) {
    liquidations = await prisma.liquidation.findMany({
      where: {
        pair: id as string,
      },
    });
  } else {
    liquidations = await prisma.liquidation.findMany({ take: 100 });
  }

  return res
    .status(200)
    .setHeader('Cache-Control', 'max-age=604800')
    .json({ liquidations });
}
