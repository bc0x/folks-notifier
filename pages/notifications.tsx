import { Container, Row, Text } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const Notifications = () => {
  const { data: session, status } = useSession();
  const [loanNotifications, setLoanNotifications] = useState<any[]>([]);
  const [account, setAccount] = useState<any>();
  const [loading, setLoading] = useState<any>(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // You can await here
      const res = await fetch('api/notifications', {
        method: 'GET',
      });
      const body = await res.json();
      console.log(body);
      setLoanNotifications(body.loanNotifications);
      setAccount(body.acount);
      setLoading(false);
    }
    !session ? null : fetchData();
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <Container sm css={{ minHeight: '80vh' }} justify='center'>
        <Row gap={1} align='center' justify='center'>
          <Text h4>Loading...</Text>
        </Row>
      </Container>
    );
  }

  if (status === 'unauthenticated') {
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
      {loanNotifications.map((notification) => (
        <Row key={notification?.id} gap={1} align='center' justify='center'>
          <Text>{notification?.pair}</Text>
        </Row>
      ))}
    </Container>
  );
};

export default Notifications;
