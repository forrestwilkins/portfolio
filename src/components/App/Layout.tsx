import TopNav from '@/components/nav/top-nav';
import { cn } from '@/utils/shared.utils';
import { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

const Layout = ({ children, style, className }: Props) => (
  <div className={cn('p-24', className)} style={{ ...style }}>
    <TopNav />

    {children}
  </div>
);

export default Layout;
