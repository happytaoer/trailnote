'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/components/Landing/NavBar';
import Footer from '@/components/Landing/Footer';
import HeroSection from '@/components/Landing/HeroSection';
import FeaturesSection from '@/components/Landing/FeaturesSection';
import TestimonialSection from '@/components/Landing/TestimonialSection';
import CTASection from '@/components/Landing/CTASection';
import { isAuthenticated } from '@/lib/authService';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        setIsLoggedIn(authenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <NavBar isLoggedIn={isLoggedIn} />
      <HeroSection isLoggedIn={isLoggedIn} />
      <FeaturesSection isLoggedIn={isLoggedIn} />
      <TestimonialSection />
      <CTASection isLoggedIn={isLoggedIn} />
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'TrailNote',
            description:
              "Map markers and route drawing: mark places, freehand draw hiking/cycling routes, set color/width/opacity, auto distance calculation, and share.",
            applicationCategory: 'MapsApplication',
            operatingSystem: 'Web',
            url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://trailnote.co'),
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
    </div>
  );
}

