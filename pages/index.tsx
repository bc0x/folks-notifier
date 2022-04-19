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
  useInput,
  FormElement,
} from '@nextui-org/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { ChangeEvent, useState } from 'react';
import LoadsGrid from '../components/LoansGrid';
import { phone as phoneValdation } from 'phone';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Home: NextPage = () => {
  const [values, setValues] = useState({
    wallet: '',
  });
  const {
    value: wallet,
    setValue: setWallet,
    bindings: walletBindings,
  } = useInput('');
  const {
    value: ratio,
    setValue: setRatio,
    bindings: ratioBinding,
  } = useInput('');
  const {
    value: phone,
    setValue: setPhone,
    bindings: phoneBindings,
  } = useInput('');
  const [loans, setLoans] = useState(undefined);
  const [santizedPhone, setSantizedPhone] = useState<string | undefined>(
    undefined
  );
  const [phoneHelperText, setPhoneHelperText] = useState<string | undefined>(
    undefined
  );
  const [ratioHelperText, setRatioHelperText] = useState<string | undefined>(
    undefined
  );
  const [loansLoading, setLoansLoading] = useState(false);
  const [submittingNotification, setSubmittingNotification] = useState(false);

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
    console.log(santizedPhone, ratio);
    setSubmittingNotification(false);
  };

  const handleGetLoans = async () => {
    setLoansLoading(true);
    const res = await fetch(`api/loans/${walletBindings.value}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'max-age=604800',
      },
    });
    const { loans } = await res.json();
    setLoans(loans);
    setLoansLoading(false);
  };

  const handlePhoneChange = (event: ChangeEvent<FormElement>) => {
    const { isValid, phoneNumber } = phoneValdation(event.target.value);
    if (!isValid) {
      setPhoneHelperText('Phone number is invalid.');
      setSantizedPhone(undefined);
    } else {
      setPhoneHelperText(undefined);
      setSantizedPhone(phoneNumber);
    }
    phoneBindings.onChange(event);
  };

  const handleRatioChange = (event: ChangeEvent<FormElement>) => {
    const ratio = event.target.value;
    if (Number(ratio) < 1.01 || Number(ratio) > 1.3) {
      setRatioHelperText('Ratio must be between 1.0 and 1.3');
    } else {
      setRatioHelperText(undefined);
    }
    ratioBinding.onChange(event);
  };

  const submitDisabled = (): boolean => {
    if (!ratioHelperText && santizedPhone && santizedPhone.length) return false;
    return true;
  };

  return (
    <div style={{ padding: '0 2rem' }}>
      <Head>
        <title>Folks Notifier</title>
        <meta name='description' content='Folks Notifier' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Spacer y={2} />
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
                    value={phoneBindings.value}
                    fullWidth
                    size='md'
                    label='SMS Number'
                    placeholder='+1 (123)123-1234'
                    onChange={handlePhoneChange}
                    helperText={phoneHelperText}
                  />
                </Col>
                <Col span={4}>
                  <Input
                    value={ratioBinding.value}
                    fullWidth
                    size='md'
                    label='Collaral Ratio'
                    type='number'
                    onChange={handleRatioChange}
                    helperText={ratioHelperText}
                  />
                </Col>
              </Row>
              <Spacer y={2} />
              <Row gap={1} align='center' justify='center'>
                <Button
                  color='gradient'
                  size='md'
                  onClick={handleSubmit}
                  disabled={submitDisabled()}
                >
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
