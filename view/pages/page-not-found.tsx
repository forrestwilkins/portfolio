import Layout from '@/components/app/layout';
import { Typography } from '@mui/material';

const PageNotFound = () => (
  <Layout>
    <Typography
      paddingTop="80px"
      textAlign="center"
      fontFamily="monospace"
      fontSize="48px"
    >
      404
    </Typography>
  </Layout>
);

export default PageNotFound;
