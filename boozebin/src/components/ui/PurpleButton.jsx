'use client';
import Link from 'next/link';

/**
 * Reusable button component with consistent purple styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Function to call when button is clicked
 * @param {string} props.href - URL for Link component (optional)
 */
const PurpleButton = ({ children, onClick, href }) => {
  const buttonClasses = "rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gradient-to-r from-purple-600 to-purple-900 text-white gap-2 hover:opacity-90 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5";
  
  return href ? (
    <Link href={href} className={buttonClasses}>
      {children}
    </Link>
  ) : (
    <button className={buttonClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export default PurpleButton;