import { ReactNode } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { cn } from '../../utils/shared.utils';

interface Props {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  external?: boolean;
  onClick?: () => void;
  state?: Record<string, unknown>;
  to: string;
}

const Link = ({
  children,
  className,
  disabled,
  external,
  onClick,
  state,
  to,
}: Props) => {
  const classes = cn(
    'text-foreground no-underline outline-none',
    'focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2',
    disabled && 'pointer-events-none',
    className,
  );

  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <ReactRouterLink
      to={to}
      state={state}
      onClick={onClick}
      className={classes}
    >
      {children}
    </ReactRouterLink>
  );
};

export default Link;
