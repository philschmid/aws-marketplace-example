import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'

const ThemeToggler = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <button
      className="w-8 h-8 bg-Indigo-100 rounded-lg flex items-center justify-center hover:ring-2 ring-Indigo-400 transition-all duration-300 focus:outline-none"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle Dark Mode"
    >
      {theme === 'light' ? (
        <MoonIcon className="text-Indigo-500 w-5 h-5" />
      ) : (
        <SunIcon className="text-Indigo-400 w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggler;
