import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Home, TrendingUp, Trophy, Edit, ClipboardList } from 'lucide-react';

interface NavBarProps {
  username: string | null;
}

export default function NavBar({ username }: NavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManager, setIsManager] = useState(false); // State to track if user is a manager
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('role'); // Assuming role is stored as 'manager' for managers
    if (role === 'manager') {
      setIsManager(true);
    }
  }, []); // Run this check once on component mount

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role'); // Remove the role when logging out
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-100 shadow-md">
      <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {username && (
              <h1 className="text-xl font-bold text-black-800">
                Welcome, {username}
              </h1>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 flex items-center">
              <Home className="mr-1 h-4 w-4" /> Dashboard
            </Link>
            <Link href="/predictions" className="text-gray-700 hover:text-gray-900 flex items-center">
              <TrendingUp className="mr-1 h-4 w-4" /> Predictions
            </Link>
            <Link href="/leaderboard" className="text-gray-700 hover:text-gray-900 flex items-center">
              <Trophy className="mr-1 h-4 w-4" /> Leaderboard
            </Link>
            {/* Show manager links if user is a manager */}
            {isManager && (
              <>
                <Link href="/manager/update-results" className="text-gray-700 hover:text-gray-900 flex items-center">
                  <Edit className="mr-1 h-4 w-4" /> Update Results
                </Link>
                <Link href="/manager/write-summary" className="text-gray-700 hover:text-gray-900 flex items-center">
                  <ClipboardList className="mr-1 h-4 w-4" /> Write Summary
                </Link>
              </>
            )}
            <Button onClick={handleLogout} variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-900">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
          <div className="md:hidden">
            <Button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} variant="ghost" className="text-gray-700">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
              <Home className="inline-block mr-2 h-4 w-4" /> Dashboard
            </Link>
            <Link href="/predictions" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
              <TrendingUp className="inline-block mr-2 h-4 w-4" /> Predictions
            </Link>
            <Link href="/leaderboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
              <Trophy className="inline-block mr-2 h-4 w-4" /> Leaderboard
            </Link>
            {/* Show manager links in mobile menu as well */}
            {isManager && (
              <>
                <Link href="/manager/update-results" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
                  <Edit className="inline-block mr-2 h-4 w-4" /> Update Results
                </Link>
                <Link href="/manager/write-summary" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900">
                  <ClipboardList className="inline-block mr-2 h-4 w-4" /> Write Summary
                </Link>
              </>
            )}
            <Button onClick={handleLogout} variant="outline" className="w-full text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-900 mt-2">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
