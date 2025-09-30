"use client";
import React from 'react';
import NavBar from '@/components/Landing/NavBar';
import Footer from '@/components/Landing/Footer';
import { useAuth } from '@/hooks/useAuth';

export default function RefundPolicyPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <>
      <NavBar isLoggedIn={isLoggedIn} />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
        <section className="space-y-4 text-base">
  <p>
    At TrailNote, we strive to ensure our users are satisfied with our services. This Refund Policy explains the conditions under which refunds may be granted.
  </p>

  <h2 className="text-xl font-semibold mt-6 mb-2">1. Eligibility for Refunds</h2>
  <ul className="list-disc list-inside mb-2">
    <li>Refund requests must be made within 14 days of the original purchase date.</li>
    <li>To be eligible for a refund, you must provide proof of purchase and a valid reason for your request.</li>
    <li>Only purchases made directly through TrailNote are eligible for refunds. If you purchased through a third party, please contact them directly.</li>
  </ul>

  <h2 className="text-xl font-semibold mt-6 mb-2">2. Non-Refundable Items</h2>
  <ul className="list-disc list-inside mb-2">
    <li>Services that have already been fully rendered or consumed.</li>
    <li>Promotional or discounted items unless required by law.</li>
    <li>Any fees paid to third-party providers.</li>
  </ul>

  <h2 className="text-xl font-semibold mt-6 mb-2">3. How to Request a Refund</h2>
  <ol className="list-decimal list-inside mb-2">
    <li>Contact our support team at <span className="underline">support@trailnote.co</span> with your order details and reason for the refund request.</li>
    <li>Our team will review your request and notify you of the approval or rejection of your refund.</li>
    <li>If approved, your refund will be processed to your original method of payment within 7-10 business days.</li>
  </ol>

  <h2 className="text-xl font-semibold mt-6 mb-2">4. Late or Missing Refunds</h2>
  <p>
    If you have not received a refund within the expected timeframe, please check your bank account, then contact your payment provider. If you still have not received your refund, contact us at <span className="underline">support@trailnote.co</span>.
  </p>

  <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to This Policy</h2>
  <p>
    We reserve the right to update or modify this Refund Policy at any time. Changes will be posted on this page. Your continued use of our services constitutes acceptance of the revised policy.
  </p>
</section>
      </main>
      <Footer />
    </>
  );
}
