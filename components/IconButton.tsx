import { Button } from '@nextui-org/react';
import { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
}

export const IconButton = ({ children }: IconButtonProps) => {
  return (
    <Button
      css={{
        dflex: 'center',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        padding: '0',
        margin: '0',
        bg: 'transparent',
        transition: '$default',
        '&:hover': {
          opacity: '0.8',
        },
        '&:active': {
          opacity: '0.6',
        },
      }}
    >
      {children}
    </Button>
  );
};
