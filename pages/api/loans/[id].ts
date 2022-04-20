// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  MainnetTokenPairs,
  getLoanInfo,
  TokenPair,
  MainnetOracle,
} from 'folks-finance-js-sdk/src';
import { BigIntToNumber } from '../../../lib/helpers';
import indexer from '../../../lib/indexer';

type Data = {
  loans: any[];
};

const APP_DICTIONARY = Object.entries(MainnetTokenPairs).map(([pair, data]) => {
  return {
    pair,
    appId: data.appId,
    collateralPool: data.collateralPool,
    borrowPool: data.borrowPool,
    linkAddr: data.linkAddr,
  };
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | null>
) {
  switch (req.method) {
    case 'GET':
      return await getLoans(req, res);
    default: {
      console.log('failed');
      return res.status(405).send(null);
    }
  }
}

async function getLoans(req: NextApiRequest, res: NextApiResponse<Data>) {
  let loans = [];
  const { id } = req.query;
  for (const entry of APP_DICTIONARY) {
    const { appId, collateralPool, borrowPool } = entry;
    const escrowAddress = await getLoanEscrowAddress(
      id as string,
      appId as number
    );
    if (escrowAddress && escrowAddress.length === 58) {
      const tokenPair: TokenPair = {
        ...entry,
      };
      try {
        const loanInfo = await getLoanInfo(
          indexer,
          tokenPair,
          MainnetOracle,
          escrowAddress
        );
        loans.push({
          ...entry,
          escrowAddress: loanInfo.escrowAddress,
          userAddress: loanInfo.userAddress,
          borrowed: BigIntToNumber(loanInfo.borrowed, borrowPool.assetDecimals),
          collateralBalance: BigIntToNumber(
            loanInfo.collateralBalance,
            collateralPool.assetDecimals
          ),
          borrowBalance: BigIntToNumber(
            loanInfo.borrowBalance,
            borrowPool.assetDecimals
          ),
          borrowBalanceLiquidationThreshold: BigIntToNumber(
            loanInfo.borrowBalanceLiquidationThreshold,
            borrowPool.assetDecimals
          ),
          healthFactor: BigIntToNumber(loanInfo.healthFactor, 14),
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
  return res
    .status(200)
    .setHeader('Cache-Control', 'max-age=604800')
    .json({ loans });
}

async function getLoanEscrowAddress(
  userAddress: string,
  tokenPairAppId: number
): Promise<string | undefined> {
  let txns: Record<string, any>;
  let noOfTxns: number;
  let lastTxn;

  // first call
  txns = await indexer
    .searchForTransactions()
    .address(userAddress)
    .applicationID(tokenPairAppId)
    .do();
  noOfTxns = txns.transactions.length;
  if (noOfTxns > 0) lastTxn = txns.transactions[noOfTxns - 1];

  // loop until we have the last txn
  while (noOfTxns === 1000) {
    const nextToken = txns['next-token'];
    txns = await indexer
      .searchForTransactions()
      .address(userAddress)
      .applicationID(tokenPairAppId)
      .nextToken(nextToken)
      .do();
    noOfTxns = txns.transactions.length;
    if (noOfTxns > 0) lastTxn = txns.transactions[noOfTxns - 1];
  }

  if (
    lastTxn &&
    lastTxn['application-transaction']['application-args'][0] ===
      Buffer.from('ae').toString('base64')
  ) {
    return lastTxn['application-transaction'].accounts[0];
  }
}
