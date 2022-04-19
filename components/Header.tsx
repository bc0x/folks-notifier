import { Row, Container, Col, Link as UILink } from '@nextui-org/react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

const Header = () => {
  const { data: session, status } = useSession();
  return (
    <Container sm justify='flex-start'>
      <Row gap={1} align='flex-start' justify='flex-start'>
        <Col span={1}>
          <Link href='/' passHref>
            <UILink block color='secondary'>
              Home
            </UILink>
          </Link>
        </Col>
        <Col span={2}>
          <Link href='/notifications' passHref>
            <UILink block color='secondary'>
              Notifications
            </UILink>
          </Link>
        </Col>
        <Col offset={7} span={2}>
          <Link
            href={!session ? '/api/auth/signin' : '/api/auth/signout'}
            passHref
          >
            <UILink block color='secondary'>
              {!session ? 'Sign In' : 'Sign Out'}
            </UILink>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default Header;
