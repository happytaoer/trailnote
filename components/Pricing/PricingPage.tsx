'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheck, FaTimes, FaArrowRight } from 'react-icons/fa';
import NavBar from '@/components/Landing/NavBar';
import Footer from '@/components/Landing/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Paddle, initializePaddle } from '@paddle/paddle-js';

/**
 * PricingPage component displays pricing options and handles Paddle checkout.
 * Redirects to /map after successful payment.
 */
export default function PricingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [paddle, setPaddle] = useState<Paddle | undefined>();

  useEffect(() => {
    const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV;
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

    if (paddleEnv && clientToken) {
      initializePaddle({ 
        environment: paddleEnv === 'production' ? 'production' : 'sandbox',
        token: clientToken 
      }).then((paddleInstance: Paddle | undefined) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
        }
      });
    } else {
      console.error("Paddle environment or client token not set in environment variables.");
    }
  }, []);

  // No need for auth checking effect as we're using AuthContext
  
  // No need for fetchSubscriptionData as we're using AuthContext

  const handleUpgradeClick = useCallback(() => {
    const premiumPriceId = process.env.NEXT_PUBLIC_PADDLE_PREMIUM_PRICE_ID;

    if (!paddle) {
      console.error('Paddle.js not initialized.');
      return;
    }
    if (!premiumPriceId) {
      console.error('Paddle Premium Price ID not configured.');
      return;
    }
    if (!user?.email) {
      console.error('User email not available for checkout.');
      return;
    }

    paddle.Checkout.open({
      items: [
        {
          priceId: premiumPriceId,
          quantity: 1
        }
      ],
      customer: {
        email: user.email,
      },
      settings: {
        // @ts-expect-error Paddle.js overlay supports successCallback, but types may not include it
        successCallback: () => {
          router.push('/map');
        },
      },
    });
  }, [paddle, user?.email, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
      <NavBar isLoggedIn={!!user} />

      {/* Pricing Header */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Select the perfect plan for your journey mapping needs
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:border-gray-200 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="p-2 bg-gray-50 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-700">Free</h3>
              </div>
              <div className="p-8 relative z-10">
                <div className="mb-6 flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-800">$0</span>
                  <span className="text-gray-500 ml-2 font-medium">/forever</span>
                </div>
                <div className="h-1 w-16 bg-gray-200 mx-auto mb-6 rounded-full"></div>
                <p className="text-gray-600 mb-8 font-medium">Perfect for casual travelers and beginners</p>
                
                <div className="space-y-4 mb-8 text-left">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 mr-3">
                      <FaCheck className="text-blue-500 text-xs" />
                    </div>
                    <span className="text-gray-700">Up to <span className="font-semibold">5</span> projects</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 mr-3">
                      <FaCheck className="text-blue-500 text-xs" />
                    </div>
                    <span className="text-gray-700">Up to <span className="font-semibold">30</span> markers per project</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 mr-3">
                      <FaCheck className="text-blue-500 text-xs" />
                    </div>
                    <span className="text-gray-700">Up to <span className="font-semibold">5</span> routes per project</span>
                  </div>
                </div>
                
                <Link 
                  href={user ? "/map" : "/auth/signup"} 
                  className="flex items-center justify-center w-full py-3 px-6 text-center bg-white text-[#4A90E2] border border-[#4A90E2] rounded-lg font-medium hover:bg-[#4A90E2] hover:text-white transition-all duration-300 group-hover:shadow-md"
                >
                  <span>{user ? "Go to Dashboard" : "Get Started Free"}</span>
                  <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </div>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden relative group transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
         
              <div className="p-2 bg-blue-50 border-b border-blue-100">
                <h3 className="text-xl font-bold text-blue-700">Premium</h3>
              </div>
              <div className="p-8 relative z-10">
                <div className="mb-6 flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-800">$3</span>
                  <span className="text-gray-500 ml-2 font-medium">/monthly</span>
                </div>
                <div className="h-1 w-16 bg-blue-200 mx-auto mb-6 rounded-full"></div>
                <p className="text-gray-600 mb-8 font-medium">For serious travelers and explorers</p>
                
                <div className="space-y-4 mb-8 text-left">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 mr-3">
                      <FaCheck className="text-blue-500 text-xs" />
                    </div>
                    <span className="text-gray-700"><span className="font-semibold">Unlimited</span> projects</span>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 mr-3">
                      <FaCheck className="text-blue-500 text-xs" />
                    </div>
                    <span className="text-gray-700">Up to <span className="font-semibold">90</span> markers per project</span>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 mr-3">
                      <FaCheck className="text-blue-500 text-xs" />
                    </div>
                    <span className="text-gray-700">Up to <span className="font-semibold">15</span> routes per project</span>
                  </div>
                </div>
                
                {!user ? (
                  <Link 
                    href={"/auth/signup?plan=premium"} 
                    className="flex items-center justify-center w-full py-3 px-6 text-center bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <span>Get Premium</span>
                    <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                ) : loading ? (
                  <button 
                    disabled
                    className="flex items-center justify-center w-full py-3 px-6 text-center bg-gray-400 text-white rounded-lg font-medium opacity-70 cursor-not-allowed"
                  >
                    Loading...
                  </button>
                ) : user.subscription && 
                   (user.subscription.subscriptionStatus === 'active' || 
                    (user.subscription.subscriptionStatus === 'canceled' && user.subscription.scheduledChange)) ? (
                  <button 
                    disabled
                    className="flex items-center justify-center w-full py-3 px-6 text-center bg-gradient-to-r from-green-500 to-green-400 text-white rounded-lg font-medium cursor-default shadow-md"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button 
                    onClick={handleUpgradeClick}
                    disabled={!paddle || !user.email} 
                    className="flex items-center justify-center w-full py-3 px-6 text-center bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Upgrade Now</span>
                    <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-3">
                  <span className="text-blue-600 font-bold">Q</span>
                </div>
                Can I upgrade from Free to Premium later?
              </h3>
              <div className="pl-11">
                <p className="text-gray-600">Yes, you can upgrade to Premium at any time. Your existing projects and data will be preserved.</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-3">
                  <span className="text-blue-600 font-bold">Q</span>
                </div>
                What happens if I exceed my plan limits?
              </h3>
              <div className="pl-11">
                <p className="text-gray-600">You'll be notified when you're approaching your plan limits. To add more projects, markers, or routes, you'll need to upgrade to Premium.</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-3">
                  <span className="text-blue-600 font-bold">Q</span>
                </div>
                Is there a monthly payment option?
              </h3>
              <div className="pl-11">
                <p className="text-gray-600">Currently, we only offer annual billing for the Premium plan to provide the best value for our users.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-10 text-gray-600 max-w-2xl mx-auto">Choose the plan that's right for you and begin mapping your adventures today.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href={user ? "/map" : "/auth/signup"} 
              className="px-8 py-4 bg-white text-blue-600 border border-blue-200 rounded-lg font-medium hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 inline-block shadow-sm hover:shadow group"
            >
              <span className="flex items-center justify-center">
                {user ? "Go to Dashboard" : "Start Free"}
                <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
              </span>
            </Link>
            {!user ? (
              <Link 
                href={"/auth/signup?plan=premium"} 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all duration-300 inline-block shadow-md hover:shadow-lg group"
              >
                <span className="flex items-center justify-center">
                  Subscribe
                  <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </Link>
            ) : loading ? (
              <button 
                disabled
                className="px-8 py-4 bg-gray-400 text-white rounded-lg font-medium opacity-70 cursor-not-allowed shadow-sm"
              >
                Loading...
              </button>
            ) : user.subscription && user.subscription.subscriptionStatus === 'active' ? (
              <button 
                disabled
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-lg font-medium cursor-default shadow-md"
              >
                Current Plan
              </button>
            ) : (
              <button 
                onClick={handleUpgradeClick}
                disabled={!paddle || !user.email} 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all duration-300 inline-block shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span className="flex items-center justify-center">
                  Upgrade to Premium
                  <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
