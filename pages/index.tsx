import {
  Container,
  Row,
  Text,
  Spacer,
  Input,
  Col,
  Button,
  Loading,
  useInput,
} from '@nextui-org/react';
import type { NextPage } from 'next';
import { useState } from 'react';
import LoadsGrid from '../components/LoansGrid';
import NotificationForm from '../components/NotificationForm';

const Home: NextPage = () => {
  const { bindings: walletBindings } = useInput('');
  const [loans, setLoans] = useState(undefined);
  const [selectedLoan, setSelectedLoan] = useState<any | undefined>(undefined);
  const [loansLoading, setLoansLoading] = useState(false);

  const handleGetLoans = async () => {
    setLoansLoading(true);
    const res = await fetch(`api/loans/${walletBindings.value}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'max-age=604800',
      },
    });
    if (res.status === 200) {
      const { loans } = await res.json();
      setLoans(loans);
    }
    setLoansLoading(false);
  };

  return (
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
            value={walletBindings.value}
            fullWidth
            size='md'
            label='Wallet Address'
            placeholder='7BZEUIEPHZGDK6E673DVOY6BVCCZC6YFAJ3QWROPBZK5XKGE5GUWDYZRUY'
            onChange={walletBindings.onChange}
          />
        </Col>
        <Col span={2}>
          <Button
            color='gradient'
            size='md'
            onClick={handleGetLoans}
            disabled={walletBindings.value.length !== 58}
          >
            {loansLoading ? (
              <Loading type='points-opacity' color='currentColor' size='sm' />
            ) : (
              'Get Loans'
            )}
          </Button>
        </Col>
      </Row>
      <Spacer y={2} />
      {loans && <LoadsGrid loans={loans} setSelectedLoan={setSelectedLoan} />}
      <Spacer y={2} />
      {selectedLoan && <NotificationForm selectedLoan={selectedLoan} />}
    </Container>
  );
};

export default Home;
