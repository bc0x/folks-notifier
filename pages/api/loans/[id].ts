// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Indexer } from 'algosdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  MainnetTokenPairs,
  getLoanInfo,
  TokenPair,
  MainnetOracle,
  LoanInfo,
} from 'folks-finance-js-sdk';

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
        appId: appId,
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
          pair,
          escrowAddress: loanInfo.escrowAddress,
          userAddress: loanInfo.userAddress,
          borrowed: Number(loanInfo.borrowed) / 1e6,
          collateralBalance: Number(loanInfo.collateralBalance) / 1e6,
          borrowBalance: Number(loanInfo.borrowBalance) / 1e6,
          borrowBalanceLiquidationThreshold:
            Number(loanInfo.borrowBalanceLiquidationThreshold) / 1e6,
          healthFactor: Number(loanInfo.healthFactor) / 1e14,
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
