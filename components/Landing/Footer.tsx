import React from 'react';
import { FaTwitter } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Image src="/logo.png" alt="TrailNote Logo" width={32} height={32} />
              <span className="text-lg font-semibold text-gray-900">TrailNote</span>
            </Link>
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} TrailNote. All rights reserved.
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
            <a
              href="https://x.com/zhshdl2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter className="text-lg" />
            </a>
            <Link href="/terms" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
