import {
  Button,
  Row,
  Col,
  Input,
  Loading,
  Spacer,
  FormElement,
  useInput,
} from '@nextui-org/react';
import { useState, ChangeEvent } from 'react';
import { phone as phoneValdation } from 'phone';

interface NotificationFormProps {
  selectedLoan: any | undefined;
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const NotificationForm = ({ selectedLoan }: NotificationFormProps) => {
  const { value: ratio, bindings: ratioBinding } = useInput('');
  const { bindings: phoneBindings } = useInput('');
  const [santizedPhone, setSantizedPhone] = useState<string | undefined>(
    undefined
  );
  const [phoneHelperText, setPhoneHelperText] = useState<string | undefined>(
    undefined
  );
  const [ratioHelperText, setRatioHelperText] = useState<string | undefined>(
    undefined
  );
  const [submittingNotification, setSubmittingNotification] = useState(false);

  const handleSubmit = async () => {
    setSubmittingNotification(true);
    const res = await fetch('api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        phone: santizedPhone,
        ratio,
        ...selectedLoan,
      }),
    });
    setSubmittingNotification(false);
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
    const ratioValue = event.target.value;
    if (Number(ratioValue) < 1.01 || Number(ratioValue) > 1.3) {
      setRatioHelperText('Ratio must be between 1.01 and 1.3');
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
            helperColor='error'
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
            helperColor='error'
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
            <Loading type='points-opacity' color='currentColor' size='md' />
          ) : (
            'Submit'
          )}
        </Button>
      </Row>
    </>
  );
};

export default NotificationForm;
