// TODO: Add styles for the layout

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props) => {
  return <div style={{ padding: '50px 50px 0' }}>{children}</div>;
};

export default Layout;
