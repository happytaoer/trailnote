'use client';

import { FC } from 'react';
import Link from 'next/link';
import { FaPlane, FaLandmark, FaCamera } from 'react-icons/fa';

interface FeaturesSectionProps {
  isLoggedIn: boolean;
}

const FeaturesSection: FC<FeaturesSectionProps> = ({ isLoggedIn }) => {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
            Powerful Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need for your <span className="text-blue-600">travel journey</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            TrailNote combines powerful mapping tools with a beautiful interface to make documenting your travels effortless
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 flex items-center justify-center mb-6 rounded-lg bg-blue-100 text-blue-600">
              <FaPlane className="text-xl" />
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Plan Your Journey
            </h3>

            <p className="text-gray-600 mb-6">
              Create custom travel routes and mark your favorite destinations on a beautiful, interactive map.
            </p>

            <Link href="/docs" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Learn more →
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 flex items-center justify-center mb-6 rounded-lg bg-green-100 text-green-600">
              <FaLandmark className="text-xl" />
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Track Your Progress
            </h3>

            <p className="text-gray-600 mb-6">
              Keep track of visited locations and completed routes with our intuitive progress tracking system.
            </p>

            <Link href="/docs" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Learn more →
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 flex items-center justify-center mb-6 rounded-lg bg-purple-100 text-purple-600">
              <FaCamera className="text-xl" />
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Share Your Stories
            </h3>

            <p className="text-gray-600 mb-6">
              Share your travel experiences with friends and family through beautiful, shareable maps and photo galleries.
            </p>

            <Link href="/docs" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Learn more →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
