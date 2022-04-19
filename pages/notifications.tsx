import { Container, Row, Text } from '@nextui-org/react';
import type { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 401;
    return { props: { loanNotification: [] } };
  }

  const loanNotification = await prisma.loanNotification.findMany({
    where: {
      user: { email: session?.user?.email },
    },
    include: {
      user: true,
    },
  });
  return {
    props: { loanNotification },
  };
};

interface NotificationProps {
  loanNotification: any[];
}

const Notifications = ({ loanNotification }: NotificationProps) => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Container sm css={{ minHeight: '80vh' }} justify='center'>
        <Row gap={1} align='center' justify='center'>
          <Text h4>You must be authenticated.</Text>
        </Row>
      </Container>
    );
  }

  return (
    <Container sm css={{ minHeight: '80vh' }} justify='center'>
      {loanNotification.map((notification) => (
        <Row key={notification.id} gap={1} align='center' justify='center'>
          <Text>{JSON.stringify(notification)}</Text>
        </Row>
      ))}
    </Container>
  );
};

export default Notifications;