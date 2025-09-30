import Image from 'next/image';
import Link from 'next/link';

interface NavBarProps {
  isLoggedIn: boolean;
}

export default function NavBar({ isLoggedIn }: NavBarProps) {
  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between max-w-7xl">
        {/* Left: Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center space-x-3 focus:outline-none">
            <Image src="/logo.png" alt="TrailNote Logo" width={32} height={32} />
            <span className="text-xl font-semibold text-gray-900">TrailNote</span>
          </Link>
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
            Docs
          </Link>
        </div>

        {/* Right: Auth/Account */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <Link href="/map" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
