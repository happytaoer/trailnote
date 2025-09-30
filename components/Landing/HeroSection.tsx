'use client';

import { FC } from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  isLoggedIn: boolean;
}

const HeroSection: FC<HeroSectionProps> = ({ isLoggedIn }) => {
  return (
    <section className="relative py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Powerful Map <span className="text-blue-600">Markers</span> to Track Your Adventures and <span className="text-blue-600">Routes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Create beautiful, interactive maps to document your travels and share your journey with others.
          </p>
        </div>

        {/* Demo iframe */}
        <div className="relative w-full h-[60vh] max-h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200 mx-auto mb-8">
          <iframe
            src="https://trailnote.co/shared/03f0f481c8da27c5d45328ffbf740a7d"
            className="w-full h-full"
            title="TrailNote Demo"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Link
            href={isLoggedIn ? "/map" : "/auth/signup"}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Get Started — It's Free
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
