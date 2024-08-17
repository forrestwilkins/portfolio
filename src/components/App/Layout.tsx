// TODO: Add styles for the layout

import { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
}

const Layout = ({ children, style }: Props) => {
  return (
    <div
      style={{
        padding: '50px 50px 0',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Layout;
