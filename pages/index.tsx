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
import LoadsGrid from '../components/LoansGrid';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Home: NextPage = () => {
  const [values, setValues] = useState({
    wallet: '',
    phone: '',
    ratio: '',
  });
  const [loans, setLoans] = useState(undefined);
  const [loansLoading, setLoansLoading] = useState(false);
  const [submittingNotification, setSubmittingNotification] = useState(false);

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
    setSubmittingNotification(true);
    // const res = await fetch('api/notifications', {
    //   method: 'POST',
    //   headers: {
    //     'Cache-Control': 'max-age=604800',
    //   },
    //   body: JSON.stringify({
    //     phone: '',
    //     wallet: '',
    //     escrow: '',
    //     ratio: ''
    //   })
    // });
    await delay(1000);
    setSubmittingNotification(false);
  };

  const handleGetLoans = async () => {
    setLoansLoading(true);
    const res = await fetch(`api/loans/${values.wallet}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'max-age=604800',
      },
    });
    const { loans } = await res.json();
    setLoans(loans);
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
        <Container sm css={{ minHeight: '80vh' }} justify='center'>
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
          <Row gap={1} align='flex-end'>
            <Col span={9}>
              <Input
                value={values.wallet}
                fullWidth
                size='md'
                label='Wallet Address'
                placeholder='7BZEUIEPHZGDK6E673DVOY6BVCCZC6YFAJ3QWROPBZK5XKGE5GUWDYZRUY'
                onChange={(e) => handleChange('wallet', e.target.value)}
              />
            </Col>
            <Col span={2}>
              <Button
                color='gradient'
                size='md'
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
          {loans && <LoadsGrid loans={loans} />}
          <Spacer y={2} />
          {loans && (
            <>
              <Row gap={1}>
                <Col span={8}>
                  <Input
                    value={values.phone}
                    fullWidth
                    size='md'
                    label='SMS Number'
                    placeholder='+1 (123)123-1234'
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    value={values.ratio}
                    fullWidth
                    size='md'
                    label='Collaral Ratio'
                    type='number'
                    placeholder='1.1'
                    onChange={(e) => handleChange('ratio', e.target.value)}
                  />
                </Col>
              </Row>
              <Spacer y={2} />
              <Row gap={1} align='center' justify='center'>
                <Button color='gradient' size='md' onClick={handleSubmit}>
                  {submittingNotification ? (
                    <Loading
                      type='points-opacity'
                      color='currentColor'
                      size='md'
                    />
                  ) : (
                    'Submit'
                  )}
                </Button>
              </Row>
            </>
          )}
        </Container>
      </main>
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

export default Home;
