import { Container, Row, Spacer, Button, Loading } from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';

const Notify: NextPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSendNotifications = async () => {
    setLoading(true);
    // TODO: auth header
    const res = await fetch('api/notifications', {
      method: 'GET',
    });
    setLoading(false);
  };

  return (
    <div style={{ padding: '0 2rem' }}>
      <Head>
        <title>Test Page</title>
        <meta name='description' content='Test Page' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Spacer y={2} />
      <main>
        <Container sm css={{ minHeight: '80vh' }} justify='center'>
          <Row gap={1} align='center' justify='center'>
            <Button
              color='gradient'
              size='md'
              onClick={handleSendNotifications}
            >
              {loading ? (
                <Loading type='points-opacity' color='currentColor' size='md' />
              ) : (
                'Submit'
              )}
            </Button>
          </Row>
        </Container>
      </main>
    </div>
  );
};

export default Notify;
