import { Box, Container, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import TopNav from '../nav/top-nav';

interface Props {
  children: ReactNode;
  sx?: SxProps;
}

const Layout = ({ children, sx }: Props) => {
  const { pathname } = useLocation();
  const isRipples = pathname === '/ripples';

  const renderContent = () => (
    <>
      <TopNav />
      {children}
    </>
  );

  if (isRipples) {
    return <Box sx={sx}>{renderContent()}</Box>;
  }
  return <Container sx={sx}>{renderContent()}</Container>;
};

export default Layout;
