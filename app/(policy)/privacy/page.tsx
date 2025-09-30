"use client";
import React from 'react';
import NavBar from '@/components/Landing/NavBar';
import Footer from '@/components/Landing/Footer';
import { useAuth } from '@/hooks/useAuth';

export default function PrivacyPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <>
      <NavBar isLoggedIn={isLoggedIn} />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <section className="space-y-4 text-base">
  <p>
    At TrailNote, your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
  </p>
  <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
  <ul className="list-disc list-inside mb-2">
    <li><strong>Personal Information:</strong> When you register, we may collect your name, email address, and other contact details.</li>
    <li><strong>Usage Data:</strong> We collect information about how you use our services, such as access times, pages viewed, and your interactions.</li>
    <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience. You can control cookies through your browser settings.</li>
  </ul>
  <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
  <ul className="list-disc list-inside mb-2">
    <li>To provide and maintain our services</li>
    <li>To improve and personalize your experience</li>
    <li>To communicate with you about updates, promotions, or important notices</li>
    <li>To analyze usage and trends to improve our website</li>
    <li>To comply with legal obligations</li>
  </ul>
  <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
  <p>
    We do not sell your personal information. We may share information with third-party service providers who assist us in operating our website, conducting our business, or serving our users, as long as those parties agree to keep this information confidential. We may also disclose information if required by law.
  </p>
  <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
  <p>
    We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, please be aware that no method of transmission over the internet or method of electronic storage is 100% secure.
  </p>
  <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
  <ul className="list-disc list-inside mb-2">
    <li>You may access, update, or delete your personal information by contacting us.</li>
    <li>You can opt out of marketing communications at any time.</li>
    <li>You may request information about the data we hold about you.</li>
  </ul>
  <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
  <p>
    We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page. Your continued use of our services after changes are made indicates your acceptance of the new policy.
  </p>
  <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact Us</h2>
  <p>
    If you have any questions or concerns about this Privacy Policy, please contact us at <span className="underline">support@trailnote.co</span>.
  </p>
</section>
      </main>
      <Footer />
    </>
  );
}
