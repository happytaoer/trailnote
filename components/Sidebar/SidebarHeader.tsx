'use client';

import Link from 'next/link';
import Image from 'next/image';

/**
 * SidebarHeader displays the app logo and title in the sidebar header.
 * No props are accepted.
 */
const SidebarHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <Link href="/" className="flex items-center space-x-2 no-underline">
        <Image src="/logo.png" alt="TrailNote Logo" width={36} height={36} />
        <span className="text-xl font-bold text-black">TrailNote</span>
      </Link>
    </div>
  );
};

export default SidebarHeader;
