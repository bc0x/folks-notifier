import {
  Container,
  Card,
  Row,
  Text,
  Spacer,
  Input,
  Col,
  Button,
  Loading,
} from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fetcher = async (input: RequestInfo, init?: RequestInit | undefined) => {
  console.log(input, init);
  const res = await fetch(input, init);
  return res.json();
};

const Home: NextPage = () => {
  const [values, setValues] = useState({
    wallet: '',
    phone: '',
    ratio: '',
  });
  const [loading, setLoading] = useState(false);
  const [loans, setLoans] = useState(undefined);
  const [loansLoading, setLoansLoading] = useState(false);

  const handleChange = (
    key: 'wallet' | 'phone' | 'ratio',
    value: string | number
  ) => {
    setValues((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await delay(1000);
    setLoading(false);
  };

  const handleGetLoans = async () => {
    setLoansLoading(true);
    const res = await fetch(`api/loans/${values.wallet}`, {
      method: 'GET',
    });
    const { loans } = await res.json();
    console.log(loans);
    setLoans(undefined);
    await delay(1000);
    setLoansLoading(false);
  };

  return (
    <div style={{ padding: '0 2rem' }}>
      <Head>
        <title>Folks Notifier</title>
        <meta name='description' content='Folks Notifier' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Spacer y={3} />
      <main>
        <Container sm css={{ minHeight: '90vh' }} justify='center'>
          <Row gap={1} align='center' justify='center'>
            <Text
              h1
              size={80}
              css={{
                textGradient: '45deg, $purple500 -20%, $pink500 100%',
              }}
              weight='bold'
            >
              Folks Notifier
            </Text>
          </Row>
          <Spacer y={2} />
          <Row gap={1} justify='space-around' align='flex-end'>
            <Col span={10}>
              <Input
                value={values.wallet}
                fullWidth
                size='xl'
                label='Wallet Address'
                placeholder='7BZEUIEPHZGDK6E673DVOY6BVCCZC6YFAJ3QWROPBZK5XKGE5GUWDYZRUY'
                onChange={(e) => handleChange('wallet', e.target.value)}
              />
            </Col>
            <Col span={2}>
              <Button
                color='gradient'
                size='xl'
                onClick={handleGetLoans}
                disabled={values.wallet.length !== 58}
              >
                {loansLoading ? (
                  <Loading
                    type='points-opacity'
                    color='currentColor'
                    size='sm'
                  />
                ) : (
                  'Get Loans'
                )}
              </Button>
            </Col>
          </Row>
          <Spacer y={2} />
          {loans && (
            <>
              <Row gap={1}>
                <Col span={8}>
                  <Input
                    value={values.phone}
                    fullWidth
                    size='xl'
                    label='SMS Number'
                    placeholder='+1 (123)123-1234'
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    value={values.ratio}
                    fullWidth
                    size='xl'
                    label='Collaral Ratio'
                    type='number'
                    placeholder='1.1'
                    onChange={(e) => handleChange('ratio', e.target.value)}
                  />
                </Col>
              </Row>
              <Spacer y={2} />
              <Row gap={1} align='center' justify='center'>
                <Col span={4}>
                  <Button color='gradient' size='xl' onClick={handleSubmit}>
                    {loading ? (
                      <Loading
                        type='points-opacity'
                        color='currentColor'
                        size='sm'
                      />
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </main>

      <footer>
        <Container sm justify='center'>
          <Row align='center' justify='center'>
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

export default Home;
