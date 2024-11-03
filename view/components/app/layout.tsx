import { Box, Container, LinearProgress, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import useAppStore from '../../store/app.store';
import TopNav from '../nav/top-nav';

interface Props {
  children: ReactNode;
  sx?: SxProps;
}

const Layout = ({ children, sx }: Props) => {
  const isLoading = useAppStore((state) => state.isAppLoading);
  const { pathname } = useLocation();

  if (isLoading) {
    return <LinearProgress sx={{ height: '100vh' }} />;
  }

  const renderContent = () => (
    <>
      <TopNav />
      {children}
    </>
  );

  if (pathname === '/ripples') {
    return <Box sx={sx}>{renderContent()}</Box>;
  }
  return <Container sx={sx}>{renderContent()}</Container>;
};

export default Layout;
