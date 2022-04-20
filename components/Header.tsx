import { Row, Container, Col, Link as UILink, Text } from '@nextui-org/react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=965887246102302751&permissions=3072&scope=bot%20applications.commands`;

const Header = () => {
  const { data: session, status } = useSession();
  return (
    <Container sm justify='flex-start'>
      <Row gap={1} align='flex-start' justify='flex-start'>
        <Col css={{ width: 'auto' }}>
          <Link href='/' passHref>
            <UILink block color='secondary'>
              Home
            </UILink>
          </Link>
        </Col>
        <Col css={{ width: 'auto' }}>
          <Link href='/notifications' passHref>
            <UILink block color='secondary'>
              Notifications
            </UILink>
          </Link>
        </Col>
        <Col css={{ width: 'auto', minWidth: 128 }}>
          <Link href={inviteUrl} passHref>
            <UILink target='_blank' rel='noreferrer' block color='secondary'>
              Invite Bot
            </UILink>
          </Link>
        </Col>
        <Col
          css={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginRight: 24,
          }}
        >
          <Link
            href={!session ? '/api/auth/signin' : '/api/auth/signout'}
            passHref
          >
            <UILink block color='secondary'>
              {!session
                ? 'Sign In'
                : `Sign Out (${session.user?.email ?? null})`}
            </UILink>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default Header;
