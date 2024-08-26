import Layout from '@/components/app-test/layout';
import { useEffect, useState } from 'react';

const ErrorPage = () => {
  const [textColor, setTextColor] = useState('white');
  const [backgroundColor, setBackgroundColor] = useState('black');

  useEffect(() => {
    const interval = setInterval(() => {
      setTextColor(
        `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255,
        )}, ${Math.floor(Math.random() * 255)})`,
      );

      setBackgroundColor(
        `rgb(${Math.floor(Math.random() * 55)}, ${Math.floor(
          Math.random() * 55,
        )}, ${Math.floor(Math.random() * 55)})`,
      );
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Layout
      className="h-screen transition-all duration-500"
      style={{ backgroundColor }}
    >
      <div
        className="text-3xl transition-all duration-500"
        style={{ color: textColor }}
      >
        Something went wrong.
      </div>
    </Layout>
  );
};

export default ErrorPage;
