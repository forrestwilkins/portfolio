import { Link, useLocation } from 'react-router-dom';

const HomePage = () => {
  const location = useLocation();

  return (
    <>
      <Link
        to="/hello-sound"
        state={{ rhizome: true, prev: location.pathname }}
        className="no-underline text-gray-50 text-3xl"
      >
        Hello Sound
      </Link>
    </>
  );
};

export default HomePage;
