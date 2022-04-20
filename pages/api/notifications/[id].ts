// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';
import { Account, LoanNotification, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

type Data = {
  error?: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | null>
) {
  switch (req.method) {
    case 'DELETE':
      return await deleteNotification(req, res);
    case 'PUT': // TODO
    default:
      return res
        .status(405)
        .json({ success: false, error: 'Unsupported Method' });
  }
}

async function deleteNotification(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getSession({ req });
  if (!session)
    return res.status(401).json({ success: false, error: 'Unautharized' });
  const { id } = req.query;
  const loanNotification = await prisma.loanNotification.delete({
    where: {
      id: id as string,
    },
  });
  return res.status(200).json({ success: true });
}
