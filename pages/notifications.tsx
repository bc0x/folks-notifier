import { Container, Row, Text } from '@nextui-org/react';
import { Account, LoanNotification } from '@prisma/client';
import type { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 401;
    return { props: { loanNotification: [] } };
  }

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
  return {
    props: { loanNotifications: JSON.stringify(loanNotifications), account },
  };
};

interface NotificationProps {
  loanNotifications: string;
  account: Account;
}

const Notifications = ({ loanNotifications, account }: NotificationProps) => {
  const { data: session } = useSession();
  const loanNotificationArr: LoanNotification[] = loanNotifications
    ? JSON.parse(loanNotifications)
    : [];

  useEffect(() => {
    async function fetchData() {
      // You can await here
      const res = await fetch('api/notifications', {
        method: 'GET',
      });
      console.log(res);
    }
    !session ? null : fetchData();
  }, [session]);

  if (!session) {
    return (
      <Container sm css={{ minHeight: '80vh' }} justify='center'>
        <Row gap={1} align='center' justify='center'>
          <Text h4>You must be authenticated.</Text>
        </Row>
      </Container>
    );
  }

  // TODO
  return (
    <Container sm css={{ minHeight: '80vh' }} justify='center'>
      {loanNotificationArr.map((notification) => (
        <Row key={notification.id} gap={1} align='center' justify='center'>
          <Text>{notification.pair}</Text>
        </Row>
      ))}
    </Container>
  );
};

export default Notifications;
