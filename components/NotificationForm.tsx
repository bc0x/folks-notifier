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
interface NotificationFormProps {
  selectedLoan: any | undefined;
}

const NotificationForm = ({ selectedLoan }: NotificationFormProps) => {
  const { value: ratio, bindings: ratioBinding } = useInput('');
  const [ratioHelperText, setRatioHelperText] = useState<string | undefined>(
    undefined
  );
  const [submittingNotification, setSubmittingNotification] = useState(false);

  const handleSubmit = async () => {
    setSubmittingNotification(true);
    const res = await fetch('api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        notifyHealthFactor: Number(ratio),
        ...selectedLoan,
      }),
    });
    setSubmittingNotification(false);
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

  return (
    <>
      <Row gap={1}>
        <Col span={12}>
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
          disabled={!ratioHelperText ? false : true}
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
