'use client';

import { FC } from 'react';
import Image from 'next/image';

const TestimonialSection: FC = () => {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
            What Our Users Say
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by travelers <span className="text-blue-600">worldwide</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
            <div className="mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <blockquote className="mb-6">
              <p className="text-gray-700 mb-4">
                "TrailNote transformed how I document my journeys. The simple interface lets me focus on the experience while creating a beautiful map of memories I can revisit anytime."
              </p>
            </blockquote>

            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                  alt="Sarah Mitchell"
                  width={48}
                  height={48}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sarah Mitchell</p>
                <p className="text-sm text-gray-600">Travel Photographer</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
            <div className="mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <blockquote className="mb-6">
              <p className="text-gray-700 mb-4">
                "I've tried many mapping apps, but TrailNote is by far the most intuitive. The ability to create custom routes and add personal notes makes it perfect for planning detailed trips."
              </p>
            </blockquote>

            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                  alt="Marcus Chen"
                  width={48}
                  height={48}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Marcus Chen</p>
                <p className="text-sm text-gray-600">Adventure Guide</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
            <div className="mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            <blockquote className="mb-6">
              <p className="text-gray-700 mb-4">
                "The sharing feature is fantastic! I can easily create maps of my favorite hiking trails and share them with my hiking group. The interface is clean and the features are exactly what I need."
              </p>
            </blockquote>

            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                  alt="Elena Rodriguez"
                  width={48}
                  height={48}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Elena Rodriguez</p>
                <p className="text-sm text-gray-600">Hiking Enthusiast</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
