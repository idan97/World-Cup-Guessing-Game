import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NavBar from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const isAuthPage = router.pathname === '/' || router.pathname === '/register';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);

    // Redirect to login if no token and not on login or register page
    if (!token && !isAuthPage) {
      router.push('/');
    }

    // Listen to storage changes in case the username or token is updated in another tab
    const handleStorageChange = () => {
      const updatedUsername = localStorage.getItem('username');
      setUsername(updatedUsername);

      const updatedToken = localStorage.getItem('token');
      if (!updatedToken && !isAuthPage) {
        router.push('/');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router, isAuthPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 flex flex-col">
      {/* Only show NavBar if not on login or register page */}
      {!isAuthPage && <NavBar username={username} />}
      {/* Apply padding only when NavBar is present */}
      <main className={`flex-grow ${!isAuthPage ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
}
