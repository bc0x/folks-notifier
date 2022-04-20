import { Col, Container, Row, Table, Text, Tooltip } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { DeleteIcon } from '../components/DeleteIcon';
import { IconButton } from '../components/IconButton';

const columns = [
  {
    uid: 'pair',
    label: 'PAIR',
  },
  {
    uid: 'notifyHealthFactor',
    label: 'NOTIFY AT',
  },
  {
    uid: 'collateralBalance',
    label: 'COLLATERAL BALANCE',
  },
  {
    uid: 'borrowBalance',
    label: 'BORROW BALANCE',
  },
  {
    uid: 'borrowBalanceLiquidationThreshold',
    label: 'MAX BORROW',
  },
  {
    uid: 'actions',
    label: 'ACTIONS',
  },
];

const Notifications = () => {
  const { data: session, status } = useSession();
  const [loanNotifications, setLoanNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<any>(false);
  const [tick, setTick] = useState<number>(0);

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
      setLoading(false);
    }
    !session ? null : fetchData();
  }, [session, tick]);

  const handleDeleteNotification = async (id: string) => {
    const res = await fetch(`api/notifications/${id}`, {
      method: 'DELETE',
    });
    const { success } = await res.json();
    if (success) {
      setTick((prev) => prev + 1);
    }
  };

  const renderCell = (loanNotification: any, columnKey: React.Key) => {
    const cellValue = loanNotification[columnKey];
    switch (columnKey) {
      case 'pair':
      case 'notifyHealthFactor':
      case 'collateralBalance':
      case 'borrowBalance':
      case 'borrowBalanceLiquidationThreshold':
        return (
          <Col css={{ paddingRight: '$space$8' }}>
            <Row>
              <Text b size={14}>
                {cellValue}
              </Text>
            </Row>
          </Col>
        );
      case 'actions':
        return (
          <Row justify='center' align='center'>
            <Col css={{ d: 'flex' }}>
              <Tooltip
                content='Delete Notification'
                color='error'
                onClick={() => handleDeleteNotification(loanNotification.id)}
              >
                <IconButton>
                  <DeleteIcon size={20} fill='#FF0080' />
                </IconButton>
              </Tooltip>
            </Col>
          </Row>
        );
      default:
        return cellValue;
    }
  };

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

  return (
    <Container sm css={{ minHeight: '80vh' }} justify='center'>
      <Table
        css={{
          height: 'auto',
          minWidth: '100%',
        }}
      >
        <Table.Header columns={columns}>
          {(column) => (
            <Table.Column
              key={column.uid}
              hideHeader={column.uid === 'actions'}
              align={column.uid === 'actions' ? 'center' : 'start'}
              css={{ paddingRight: '$space$8' }}
            >
              {column.label}
            </Table.Column>
          )}
        </Table.Header>
        <Table.Body items={loanNotifications}>
          {(item: any) => (
            <Table.Row>
              {(columnKey) => (
                <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
              )}
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Container>
  );
};

export default Notifications;
