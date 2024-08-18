import { Link, useLocation } from 'react-router-dom';

const HomePage = () => {
  const location = useLocation();

  return (
    <>
      <Link
        to="/hello-sound"
        state={{ from: 'rhizome', prev: location.pathname }}
        style={{ color: 'white', textDecoration: 'none', fontSize: '30px' }}
      >
        Hello Sound
      </Link>
    </>
  );
};

export default HomePage;
