import { Card, Grid, Text, Divider, Button, Row } from '@nextui-org/react';
import { Dispatch } from 'react';

interface LoansGridProps {
  loans: any[];
  setSelectedLoan: Dispatch<any>;
}

const LoadsGrid = ({ loans, setSelectedLoan }: LoansGridProps) => {
  return (
    <Grid.Container gap={2}>
      <Grid sm={6} justify='space-around'>
        {loans.map((loan) => (
          <Card
            key={`${loan.pair}-${loan.escrowAddress}`}
            css={{ mw: '330px' }}
          >
            <Card.Header>
              <Text b>{loan.pair}</Text>
            </Card.Header>
            <Divider />
            <Card.Body css={{ py: '$10' }}>
              <Row justify='center' align='center'>
                <Text>{`Collateral Balance: ${loan.collateralBalance}`}</Text>
              </Row>
              <Row justify='center' align='center'>
                <Text>{`Borrow Balance: ${loan.borrowBalance}`}</Text>
              </Row>
              <Row justify='center' align='center'>
                <Text>{`Health Factor: ${loan.healthFactor}`}</Text>
              </Row>
            </Card.Body>
            <Divider />
            <Card.Footer>
              <Row justify='center'>
                <Button
                  size='sm'
                  color='gradient'
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedLoan(loan);
                  }}
                >
                  Select
                </Button>
              </Row>
            </Card.Footer>
          </Card>
        ))}
      </Grid>
    </Grid.Container>
  );
};

export default LoadsGrid;
