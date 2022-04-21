import {
  Col,
  Container,
  Row,
  SortDescriptor,
  Table,
  Text,
  Tooltip,
  useCollator,
} from '@nextui-org/react';
import { Liquidation } from '@prisma/client';
import { useEffect, useState } from 'react';

const columns = [
  {
    uid: 'pair',
    label: 'PAIR',
    allowsSorting: false,
  },
  {
    uid: 'amountPaid',
    label: 'LOAN REPAID',
    allowsSorting: true,
  },
  {
    uid: 'collateralReceived',
    label: 'LIQUIDATED AMOUNT',
    allowsSorting: true,
  },
  {
    uid: 'liquidatorWallet',
    label: 'LIQUIDATOR',
    allowsSorting: false,
  },
  {
    uid: 'group',
    label: 'TX GROUP',
    allowsSorting: false,
  },
];

const Liquidations = () => {
  const [liquidations, setLiquidations] = useState<any[]>([]);
  const [loading, setLoading] = useState<any>(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>();
  const collator = useCollator({ numeric: true });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch('api/liquidations/ALGO-USDC', {
        method: 'GET',
      });
      const body = await res.json();
      setLiquidations(body.liquidations);
      setLoading(false);
    }
    fetchData();
  }, []);

  const sort = (sortDescriptor: SortDescriptor) => {
    const sorted = liquidations.sort((a, b) => {
      let first = a[sortDescriptor.column as string];
      let second = b[sortDescriptor.column as string];
      let cmp = collator.compare(first, second);
      if (sortDescriptor.direction === 'descending') {
        cmp *= -1;
      }
      return cmp;
    });
    setSortDescriptor(sortDescriptor);
    setLiquidations(sorted);
  };

  const renderCell = (liquidations: any, columnKey: React.Key) => {
    const cellValue = liquidations[columnKey];
    switch (columnKey) {
      case 'pair':
      case 'amountPaid':
      case 'collateralReceived':
        return (
          <Col span={2} css={{ paddingRight: '$space$8' }}>
            <Row>
              <Text b size={14}>
                {cellValue}
              </Text>
            </Row>
          </Col>
        );
      case 'liquidatorWallet':
      case 'group':
        return (
          <Tooltip content={cellValue}>
            <Col css={{ d: 'flex', paddingRight: '$space$8', mw: 250 }}>
              <Row>
                <Text
                  b
                  size={14}
                  css={{
                    overflow: 'hidden',
                    to: 'ellipsis',
                  }}
                >
                  {cellValue}
                </Text>
              </Row>
            </Col>
          </Tooltip>
        );
      default:
        return cellValue;
    }
  };

  if (loading) {
    return (
      <Container sm css={{ minHeight: '80vh' }} justify='center'>
        <Row gap={1} align='center' justify='center'>
          <Text h4>Loading...</Text>
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
        onSortChange={sort}
        sortDescriptor={sortDescriptor}
      >
        <Table.Header columns={columns}>
          {(column) => (
            <Table.Column
              key={column.uid}
              hideHeader={column.uid === 'actions'}
              align={column.uid === 'actions' ? 'center' : 'start'}
              css={{ paddingRight: '$space$8' }}
              allowsSorting={column.allowsSorting}
            >
              {column.label}
            </Table.Column>
          )}
        </Table.Header>
        <Table.Body items={liquidations}>
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

export default Liquidations;
