import { Link as MuiLink, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

interface Props {
  children: ReactNode;
  disabled?: boolean;
  external?: boolean;
  leftSpace?: boolean;
  onClick?: () => void;
  state?: Record<string, unknown>;
  sx?: SxProps;
  to: string;
}

const Link = ({
  children,
  disabled,
  external,
  leftSpace,
  onClick,
  state,
  sx,
  to,
}: Props) => {
  const linkProps = external
    ? { href: to, target: '_blank', rel: 'noopener noreferrer' }
    : { component: ReactRouterLink, state, to };

  return (
    <MuiLink
      {...linkProps}
      onClick={onClick}
      sx={{
        pointerEvents: disabled ? 'none' : undefined,
        textDecoration: 'none',
        color: 'text.primary',
        ...sx,
      }}
    >
      {leftSpace ? ' ' : ''}
      {children}
    </MuiLink>
  );
};

export default Link;
