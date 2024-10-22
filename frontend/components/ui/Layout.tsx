import NavBar from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
  username: string | null;
}

export default function Layout({ children, username }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-blue-500 flex flex-col">
      <NavBar username={username} />
      <main className="flex-grow pt-16">
        {children}
      </main>
    </div>
  );
}