import { Shield, Lock, Award } from "lucide-react";
import { useSiteStatistics } from "@/hooks/useSiteStatistics";

export default function AboutSection() {
  const { aumValue, investorsCount, propertiesCount, citiesCount, isLoading } = useSiteStatistics();
  
  const stats = [
    { value: aumValue, label: "Assets Under Management" },
    { value: investorsCount, label: "Happy Investors" },
    { value: propertiesCount, label: "Properties Listed" },
    { value: `${citiesCount} Cities`, label: "Across India" }
  ];

  const certifications = [];

  return (
    <section id="about" className="py-12 gradient-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="will-change-transform animate-fade-in-up">
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About fractOWN
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              We're democratizing real estate investment in India by making premium properties accessible to everyone. Our mission is to enable wealth creation through fractional property ownership.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Founded by real estate and fintech veterans, fractOWN combines deep market expertise with cutting-edge technology to deliver superior investment experiences.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="glass-card p-4 rounded-xl will-change-transform fast-transition hover:rich-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-base text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            
          </div>
          
          <div className="relative will-change-transform">
            <div className="glass-card rounded-2xl overflow-hidden rich-shadow">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="fractOWN team collaboration"
                className="w-full h-auto fast-transition hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 glass-effect p-4 rounded-xl">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-fractown-accent" />
                <span className="text-sm font-medium text-gray-700">Industry Leader</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
