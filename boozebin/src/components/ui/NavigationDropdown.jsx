"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, LogOut, Home, GlassWater, Camera } from 'lucide-react';

const NavigationDropdown = ({ onSignOut, isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    setIsOpen(false);
    if (onSignOut) onSignOut();
  };

  return (
    <div className="absolute top-4 right-4 z-10" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 bg-purple-900/80 text-white rounded-md hover:bg-purple-800 transition-colors"
      >
        <Menu size={18} />
        <span className="hidden sm:inline">Menu</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-[#1a1a2e] border border-purple-800">
          <div className="py-1">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-purple-800/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Home size={16} />
              Home
            </Link>
            
            {isLoggedIn && (
              <Link 
                href="/saved-drinks" 
                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-purple-800/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <GlassWater size={16} />
                My Saved Drinks
              </Link>
            )}
            
            {isLoggedIn && (
              <Link 
                href="/image-detection" 
                className="flex items-center gap-2 px-4 py-2 text-white hover:bg-purple-800/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Camera size={16} />
                Image Detection
              </Link>
            )}
            
            {isLoggedIn && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-white hover:bg-purple-800/50 transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationDropdown;