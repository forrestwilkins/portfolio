import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <>
      <Link
        to="/hello-sound"
        style={{ color: 'white', textDecoration: 'none', fontSize: '30px' }}
      >
        Hello Sound
      </Link>
    </>
  );
};

export default HomePage;
