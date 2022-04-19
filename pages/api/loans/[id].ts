// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Indexer } from 'algosdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  MainnetTokenPairs,
  getLoanInfo,
  TokenPair,
  MainnetOracle,
} from 'folks-finance-js-sdk/src';

type Data = {
  loans: any[];
};

const indexerClient = new Indexer(
  'null',
  'https://algoindexer.algoexplorerapi.io',
  ''
);

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
  res: NextApiResponse<Data>
) {
  let loans = [];
  const { id } = req.query;
  for (const entry of APP_DICTIONARY) {
    const { pair, appId, collateralPool, borrowPool, linkAddr } = entry;
    const escrowAddress = await getLoanEscrowAddress(
      id as string,
      appId as number
    );
    if (escrowAddress && escrowAddress.length === 58) {
      const tokenPair: TokenPair = {
        appId,
        collateralPool,
        borrowPool,
        linkAddr,
      };
      try {
        const loanInfo = await getLoanInfo(
          indexerClient,
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
  txns = await indexerClient
    .searchForTransactions()
    .address(userAddress)
    .applicationID(tokenPairAppId)
    .do();
  noOfTxns = txns.transactions.length;
  if (noOfTxns > 0) lastTxn = txns.transactions[noOfTxns - 1];

  // loop until we have the last txn
  while (noOfTxns === 1000) {
    const nextToken = txns['next-token'];
    txns = await indexerClient
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

function BigIntToNumber(value: bigint, decimals: number) {
  return Number(value) / (1 * Math.pow(10, decimals));
}
