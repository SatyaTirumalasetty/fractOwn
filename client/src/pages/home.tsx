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
        <div className="py-12 gradient-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-card rounded-3xl p-6 md:p-10 premium-shadow will-change-transform animate-fade-in-up">
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex-shrink-0 w-14 h-14 gradient-accent rounded-2xl flex items-center justify-center lightweight-shadow">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gradient mb-1">Investment Risk Disclosure</h3>
                  <p className="text-gray-600">Important information about real estate investment risks</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: "📈", text: "Real estate investments are subject to market risks and regulatory changes that may affect returns." },
                  { icon: "📊", text: "Past performance does not guarantee future results. Property values may fluctuate based on market conditions." },
                  { icon: "🏠", text: "Rental income is not guaranteed and may vary based on occupancy rates and market demand." },
                  { icon: "💧", text: "Fractional ownership investments may have limited liquidity compared to traditional securities." },
                  { icon: "📋", text: "Please read all investment documents carefully and consult with financial advisors before investing." },
                  { icon: "⚖️", text: "fractOWN operates under applicable Indian regulations for real estate investment platforms." }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-white/50 fast-transition hover:bg-white/80 hover:rich-shadow will-change-transform"
                  >
                    <span className="text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-lg lightweight-shadow">{item.icon}</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 gradient-primary rounded-xl">
                <p className="text-center text-white text-sm font-medium">
                  📞 For detailed risk assessment and investment guidance, please consult with our certified financial advisors
                </p>
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
