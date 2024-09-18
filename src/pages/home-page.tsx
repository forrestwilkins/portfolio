import { Link } from 'react-router-dom';

const HomePage = () => (
  <div className="flex flex-col gap-7">
    <Link
      to="/ripples"
      className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
    >
      Ripples
    </Link>

    <Link
      to="/color-grid"
      className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
    >
      Color Grid
    </Link>

    <Link
      to="/audio-visual"
      className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
    >
      Audio Visual
    </Link>

    <Link
      to="/hello-sound"
      className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
    >
      Hello Sound
    </Link>
  </div>
);

export default HomePage;
