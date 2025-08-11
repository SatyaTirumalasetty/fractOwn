import { Search, Calculator, CreditCard, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function HowItWorks() {
  // Load site content
  const { data: siteContent = {} } = useQuery({
    queryKey: ['/api/admin/site-content'],
  });

  const defaultSteps = [
    {
      icon: Search,
      title: "1. Browse Properties",
      description: "Explore vetted properties across major Indian cities with detailed financials and projections",
      color: "bg-fractown-primary"
    },
    {
      icon: Calculator,
      title: "2. Calculate Returns",
      description: "Use our investment calculator to determine your share size and expected returns",
      color: "bg-fractown-secondary"
    },
    {
      icon: CreditCard,
      title: "3. Invest Securely",
      description: "Complete KYC verification and invest with secure payment methods starting from ₹5,000",
      color: "bg-fractown-accent"
    },
    {
      icon: TrendingUp,
      title: "4. Earn Returns",
      description: "Benefit from property appreciation and market growth over time",
      color: "bg-purple-600"
    }
  ];

  // Use dynamic content or fallback to defaults
  const steps = (siteContent as any)?.howItWorks?.steps || defaultSteps;

  const defaultBenefits = [
    {
      title: "Lower Entry Barrier",
      description: "Start with as little as ₹5,000 instead of crores for full property ownership"
    },
    {
      title: "Diversified Portfolio",
      description: "Spread investments across multiple properties and locations to reduce risk"
    },
    {
      title: "Professional Management",
      description: "No tenant hassles - we handle everything from maintenance to rent collection"
    },
    {
      title: "High Liquidity",
      description: "Trade your fractional shares on our secondary marketplace"
    }
  ];

  // Use dynamic content or fallback to defaults
  const benefits = (siteContent as any)?.whyChoose?.benefits || defaultBenefits;

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {(siteContent as any)?.howItWorks?.title || "How Fractional Ownership Works"}
          </h2>
          <p className="text-xl text-gray-600">
            {(siteContent as any)?.howItWorks?.subtitle || "Simple steps to start your real estate investment journey"}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            // For dynamic content, use a default icon or map icon strings to components
            const IconComponent = step.icon || Search;
            const iconElement = typeof step.icon === 'string' ? (
              <span className="text-white text-2xl">{step.icon}</span>
            ) : (
              <IconComponent className="text-white text-2xl w-8 h-8" />
            );
            
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${step.color || 'bg-blue-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {iconElement}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{(siteContent as any)?.whyChoose?.title || "Why Choose Fractional Ownership?"}</h3>
              <ul className="space-y-4">
                {benefits.map((benefit: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-fractown-secondary rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Investment analytics and charts"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
