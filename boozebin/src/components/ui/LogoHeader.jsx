'use client';
import Image from 'next/image';

/**
 * Reusable logo header component for auth pages
 * @param {Object} props - Component props
 * @param {string} props.title - Header title text
 */
const LogoHeader = ({ title }) => (
  <div className="flex flex-col items-center mb-6">
    <Image src="/LogoNoBackground.png" alt="Boozebin Logo" width={80} height={80} className="mb-4" />
    <h1 className="text-4xl font-bold text-white">{title}</h1>
    <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2"></div>
  </div>
);

export default LogoHeader;