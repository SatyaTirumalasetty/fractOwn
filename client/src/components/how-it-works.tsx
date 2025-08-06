import { Search, Calculator, DollarSign, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Browse Properties",
      description: "Explore our curated selection of premium properties across major Indian cities with detailed information and high-quality images."
    },
    {
      icon: Calculator,
      title: "Calculate Investment",
      description: "Use our investment calculator to determine your potential returns and choose the investment amount that suits your budget."
    },
    {
      icon: DollarSign,
      title: "Invest Your Amount",
      description: "Complete your investment with our secure payment system. Start with as little as ₹10L and own a fraction of premium real estate."
    },
    {
      icon: TrendingUp,
      title: "Track & Earn",
      description: "Monitor your portfolio performance in real-time and earn returns through property appreciation and rental income."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Fractional Ownership Works
          </h2>
          <p className="text-xl text-gray-600">
            Simple steps to start your real estate investment journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">₹10L</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Minimum Investment</div>
              <div className="text-gray-600">Start your real estate journey with an affordable entry point</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">8-12%</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Expected Returns</div>
              <div className="text-gray-600">Competitive returns from property appreciation and rentals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">50+</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Properties Available</div>
              <div className="text-gray-600">Diversify across premium properties in top locations</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}