'use client';

import { FC } from 'react';
import Link from 'next/link';

interface CTASectionProps {
  isLoggedIn: boolean;
}

const CTASection: FC<CTASectionProps> = ({ isLoggedIn }) => {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-6">
          Ready to Get Started?
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
          Start <span className="text-blue-600">mapping</span> your journey today
        </h2>

        <p className="text-lg mb-8 text-gray-600 max-w-2xl mx-auto">
          Create your free account today and begin documenting your travel experiences with TrailNote's powerful yet simple tools.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-700">No credit card required</p>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-700">Free forever plan</p>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-700">Cancel anytime</p>
          </div>
        </div>

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
    </section>
  );
};

export default CTASection;
