import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Layout from '@/components/ui/Layout';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'username') {
        setUsername(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Layout username={username}>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;