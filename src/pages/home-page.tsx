import { Link, useLocation } from 'react-router-dom';

const HomePage = () => {
  const location = useLocation();

  return (
    <>
      <Link
        to="/hello-sound"
        state={{ rhizome: true, prev: location.pathname }}
        className="text-3xl text-gray-50 no-underline"
      >
        Hello Sound
      </Link>
    </>
  );
};

export default HomePage;
