import TopNav from '@/components/nav/top-nav';
import { Container, SxProps } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  sx?: SxProps;
}

const Layout = ({ children, sx }: Props) => (
  <Container sx={sx}>
    <TopNav />

    {children}
  </Container>
);

export default Layout;
