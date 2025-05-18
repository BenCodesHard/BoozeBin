import Link from 'next/link';

function Header() {
  return (
    <header 
      className="md:fixed relative sm:relative top-0 left-0 z-50 w-full bg-transparent backdrop-blur-xl text-white p-4 flex items-center justify-between shadow-xl"
    >
      <Link href="/" className="flex items-center">
        <img 
          src="/LogoNoBackground.png" 
          alt="Logo" 
          className="h-10 mr-3 rounded-full" 
        />
        <span className="font-semibold text-xl tracking-tight">BoozeBin</span>
      </Link>
      <nav className="flex space-x-4">
      </nav>
    </header>
  );
}

export default Header;
