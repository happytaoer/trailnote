"use client";
import React from 'react';
import NavBar from '@/components/Landing/NavBar';
import Footer from '@/components/Landing/Footer';
import { useAuth } from '@/hooks/useAuth';

export default function TermsPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <>
      <NavBar isLoggedIn={isLoggedIn} />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <section className="space-y-4 text-base">
  <p>
    Welcome to TrailNote! These Terms of Service ("Terms") govern your access to and use of our website and services. By using TrailNote, you agree to comply with these Terms. Please read them carefully.
  </p>

  <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
  <p>
    By accessing or using TrailNote, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our services.
  </p>

  <h2 className="text-xl font-semibold mt-6 mb-2">2. Use of Our Service</h2>
  <ul className="list-disc list-inside mb-2">
    <li>You must be at least 18 years old or have legal parental or guardian consent to use TrailNote.</li>
    <li>You agree to provide accurate and complete information when creating an account.</li>
    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
    <li>You may not use TrailNote for any unlawful or unauthorized purpose.</li>
  </ul>

  <h2 className="text-xl font-semibold mt-6 mb-2">3. Intellectual Property</h2>
  <p>
    All content, features, and functionality on TrailNote, including text, graphics, logos, and software, are the exclusive property of TrailNote or its licensors. You may not copy, modify, distribute, or create derivative works without our written permission.
  </p>

  <h2 className="text-xl font-semibold mt-6 mb-2">4. Termination</h2>
  <p>
    We reserve the right to suspend or terminate your access to TrailNote at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.
  </p>

  <h2 className="text-xl font-semibold mt-6 mb-2">5. Disclaimers</h2>
  <p>
    TrailNote is provided on an "as is" and "as available" basis. We do not warrant that the service will be uninterrupted, error-free, or secure. We disclaim all warranties, express or implied.
  </p>

  <h2 className="text-xl font-semibold mt-6 mb-2">6. Limitation of Liability</h2>
  <p>
    To the fullest extent permitted by law, TrailNote and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our service.
  </p>

  <h2 className="text-xl font-semibold mt-6 mb-2">7. Changes to Terms</h2>
  <p>
    We may update these Terms from time to time. We will notify you of significant changes by posting the new Terms on this page. Continued use of TrailNote after changes means you accept the revised Terms.
  </p>

  <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact Us</h2>
  <p>
    If you have any questions about these Terms, please contact us at <span className="underline">support@trailnote.co</span>.
  </p>
</section>
      </main>
      <Footer />
    </>
  );
}
