// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Indexer } from 'algosdk';

type Data = {
  loans: any[];
};

const indexerClient = new Indexer('https://algoindexer.algoexplorerapi.io');

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // TODO - get loan info
  return res.status(200).json({ loans: ['test'] });
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
