import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";

import PropertiesSection from "@/components/properties-section";
import DynamicHowItWorks from "@/components/dynamic-how-it-works";
import TestimonialsSection from "@/components/testimonials-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  // Fetch dynamic risk disclosure content
  const { data: riskDisclosureContent = [] } = useQuery<any[]>({
    queryKey: ["/api/content?section=risk_disclosure"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  // Scroll to top when component mounts or page refreshes
  useEffect(() => {
    // Always scroll to top when page loads/refreshes
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Handle browser refresh - scroll to top immediately
    const handleBeforeUnload = () => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div id="home">
          <HeroSection />
        </div>

        <div id="properties">
          <PropertiesSection />
        </div>
        <div id="how-it-works">
          <DynamicHowItWorks />
        </div>
        <TestimonialsSection />
        <div id="about">
          <AboutSection />
        </div>
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
                {(() => {
                  const content = riskDisclosureContent.find((c: any) => c.key === 'risk_disclosure_content');
                  if (!content) return (
                    <p>Real estate investments are subject to market risks. Please read all investment documents carefully and consult with financial advisors before investing.</p>
                  );
                  
                  const lines = content.content.split('\n').filter((line: string) => line.trim());
                  const sections: { title: string; items: string[] }[] = [];
                  let currentSection: { title: string; items: string[] } | null = null;
                  
                  for (const line of lines) {
                    if (line.startsWith('•')) {
                      if (currentSection) {
                        currentSection.items.push(line.substring(1).trim());
                      }
                    } else if (line.trim() && !line.startsWith('•')) {
                      if (currentSection) {
                        sections.push(currentSection);
                      }
                      currentSection = { title: line.trim(), items: [] };
                    }
                  }
                  
                  if (currentSection) {
                    sections.push(currentSection);
                  }
                  
                  return (
                    <div className="space-y-4">
                      {sections.map((section, index) => (
                        <div key={index}>
                          <h4 className="font-semibold text-gray-800 mb-2">{section.title}</h4>
                          {section.items.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              {section.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="text-gray-600">{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
        <div id="contact">
          <ContactSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
