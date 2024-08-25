import { Link, useLocation } from 'react-router-dom';

const HomePage = () => {
  const location = useLocation();

  return (
    <Link to="/hello-sound" state={{ rhizome: true, prev: location.pathname }}>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Hello Sound
      </h1>
    </Link>
  );
};

export default HomePage;
