import { Text, Row, Container, Spacer } from '@nextui-org/react';
import Head from 'next/head';
import { Dispatch, ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={{ padding: '0 2rem' }}>
      <Head>
        <title>Folks Notifier</title>
        <meta name='description' content='Folks Notifier' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Spacer y={1} />
      <Header />
      <Spacer y={2} />
      <main>{children}</main>
      <Spacer y={3} />
      <footer>
        <Container sm justify='center'>
          <Row gap={1} align='center' justify='center'>
            <Text
              css={{
                textGradient: '45deg, $purple500 -20%, $pink500 100%',
              }}
              weight='bold'
            >
              built by bcox
            </Text>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Layout;
