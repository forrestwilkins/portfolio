import { useEffect, useState } from 'react';
import Layout from '../components/App/Layout';

const ErrorPage = () => {
  const [textColor, setTextColor] = useState('white');
  const [backgroundColor, setBackgroundColor] = useState('black');

  useEffect(() => {
    const interval = setInterval(() => {
      setTextColor(
        `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255
        )}, ${Math.floor(Math.random() * 255)})`
      );

      setBackgroundColor(
        `rgb(${Math.floor(Math.random() * 55)}, ${Math.floor(
          Math.random() * 55
        )}, ${Math.floor(Math.random() * 55)})`
      );
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Layout
      style={{
        backgroundColor,
        transition: 'all 0.4s ease-in-out',
        height: '100vh',
      }}
    >
      <div
        style={{
          color: textColor,
          textDecoration: 'none',
          fontSize: '30px',
          transition: 'all 0.4s ease-in-out',
        }}
      >
        Something went wrong.
      </div>
    </Layout>
  );
};

export default ErrorPage;
