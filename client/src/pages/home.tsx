import { useEffect } from "react";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";

import PropertiesSection from "@/components/properties-section";
import HowItWorks from "@/components/how-it-works";
import Testimonials from "@/components/testimonials";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  // Scroll to top when component mounts (only if not navigating to a specific section)
  useEffect(() => {
    // Check if we need to scroll to a specific section (like properties)
    const hash = window.location.hash;
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />

        <PropertiesSection />
        <HowItWorks />
        <Testimonials />
        <AboutSection />
        <div className="py-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Investment Risk Disclosure
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Real estate investments are subject to market risks and regulatory changes that may affect returns.</p>
                <p>• Past performance does not guarantee future results. Property values may fluctuate based on market conditions.</p>
                <p>• Rental income is not guaranteed and may vary based on occupancy rates and market demand.</p>
                <p>• Fractional ownership investments may have limited liquidity compared to traditional securities.</p>
                <p>• Please read all investment documents carefully and consult with financial advisors before investing.</p>
                <p>• fractOWN operates under applicable Indian regulations for real estate investment platforms.</p>
              </div>
            </div>
          </div>
        </div>
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
