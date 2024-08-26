import TopNav from '@/components/nav/top-nav';
import { cn } from '@/utils/shared.utils';
import { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?(): void;
}

const Layout = ({ children, style, className, onClick }: Props) => (
  <div className={cn('p-24', className)} style={{ ...style }} onClick={onClick}>
    <TopNav />

    {children}
  </div>
);

export default Layout;
