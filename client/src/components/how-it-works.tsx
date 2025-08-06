import { Search, Calculator, CreditCard, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
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

  const benefits = [
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

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-fractown-primary/10 to-fractown-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-gradient-to-tr from-fractown-secondary/10 to-fractown-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Fractional Ownership Works
          </h2>
          <p className="text-xl text-gray-600">
            Simple steps to start your real estate investment journey
          </p>
        </div>
        
        {/* Enhanced steps with modern design and animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={index} 
                className="group text-center relative"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Connecting lines between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-fractown-primary/30 to-fractown-accent/30 transform translate-x-4 -translate-y-1/2"></div>
                )}
                
                <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}>
                  <IconComponent className="text-white w-10 h-10" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-fractown-primary transition-colors duration-300">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{step.description}</p>
              </div>
            );
          })}
        </div>
        
        {/* Enhanced Benefits Section */}
        <div className="bg-gray-50 rounded-2xl p-8 transform transition-all duration-300 hover:shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose Fractional Ownership?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="text-center p-4 bg-white rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <div className="w-10 h-10 bg-fractown-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
