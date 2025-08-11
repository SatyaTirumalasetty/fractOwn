import { useQuery } from "@tanstack/react-query";
import { Search, Calculator, Shield, TrendingUp } from "lucide-react";

interface ContentSection {
  id: string;
  key: string;
  title: string;
  content: string;
  contentType: string;
  section: string;
  isActive: boolean;
  displayOrder: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const defaultIcons = {
  search: Search,
  calculator: Calculator,
  shield: Shield,
  "trending-up": TrendingUp
};

const defaultColors = {
  blue: "text-blue-600 bg-blue-50",
  green: "text-green-600 bg-green-50", 
  orange: "text-orange-600 bg-orange-50",
  purple: "text-purple-600 bg-purple-50"
};

export default function DynamicHowItWorks() {
  // Fetch dynamic how it works content
  const { data: howItWorksContent = [], isLoading } = useQuery<ContentSection[]>({
    queryKey: ["/api/content?section=how_it_works"],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-16 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Group content by steps
  const steps = [];
  const stepKeys = ['step1', 'step2', 'step3', 'step4'];
  
  stepKeys.forEach((stepKey, index) => {
    const title = howItWorksContent.find(c => c.key === `how_it_works_${stepKey}_title`)?.content;
    const description = howItWorksContent.find(c => c.key === `how_it_works_${stepKey}_description`)?.content;
    const titleMeta = howItWorksContent.find(c => c.key === `how_it_works_${stepKey}_title`)?.metadata;
    
    if (title && description) {
      const iconName = titleMeta?.icon || Object.keys(defaultIcons)[index];
      const color = titleMeta?.color || Object.keys(defaultColors)[index];
      const IconComponent = defaultIcons[iconName as keyof typeof defaultIcons] || defaultIcons.search;
      const colorClass = defaultColors[color as keyof typeof defaultColors] || defaultColors.blue;
      
      steps.push({
        number: index + 1,
        title,
        description,
        icon: IconComponent,
        colorClass
      });
    }
  });

  // Fallback to default content if no dynamic content is available
  if (steps.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Fractional Ownership Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to start your real estate investment journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 text-blue-600 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Browse Properties</h3>
              <p className="text-gray-600">
                Explore vetted properties across major Indian cities with detailed financials and projections
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 text-green-600 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calculator className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Calculate Returns</h3>
              <p className="text-gray-600">
                Use our investment calculator to determine your share size and expected returns
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 text-orange-600 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Invest Securely</h3>
              <p className="text-gray-600">
                Complete KYC verification and invest with secure payment methods starting from ₹5,000
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 text-purple-600 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Earn Returns</h3>
              <p className="text-gray-600">
                Benefit from property appreciation and market growth over time
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How Fractional Ownership Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple steps to start your real estate investment journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${step.colorClass} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.number}. {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}