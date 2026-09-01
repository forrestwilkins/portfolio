import { useEffect, useState } from 'react';
import HomeLink from '../components/home/home-link';
import useAppStore from '../store/app.store';

const LINKS = [
  {
    label: 'Praxis - Chat Based CDM',
    to: 'https://praxis-dev.ntc.dsausa.org/i/52ec59ef',
    external: true,
  },
  { label: 'Live Canvas', to: '/draw' },
  { label: 'Color Grid', to: '/color-grid' },
  { label: 'Ripples', to: '/ripples' },
];

const HomePage = () => {
  const token = useAppStore((state) => state.token);
  const [time, setTime] = useState<string>();

  useEffect(() => {
    if (!token) {
      return;
    }
    const init = async () => {
      const result = await fetch('/api/health', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: { timestamp: string } = await result.json();
      setTime(data.timestamp);
    };
    init();
  }, [token]);

  return (
    <div className="flex flex-col pt-5 pl-17.5 lg:pt-0 lg:pl-3">
      <p className="text-muted-foreground font-mono text-sm tracking-[0.28em] uppercase">
        Forrest Wilkins
      </p>

      <nav className="mt-7 flex flex-col gap-7 md:mt-8 md:gap-6">
        {LINKS.map(({ external, label, to }) => (
          <HomeLink key={to} label={label} to={to} external={external} />
        ))}
      </nav>

      {time && (
        <p className="text-muted-foreground hover:text-foreground fixed right-2.5 bottom-2.5 font-mono text-[8px] transition-colors duration-300">
          {time}
        </p>
      )}
    </div>
  );
};

export default HomePage;
