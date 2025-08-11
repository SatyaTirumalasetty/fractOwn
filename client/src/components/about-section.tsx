import { Shield, Lock, Award } from "lucide-react";

export default function AboutSection() {
  const stats = [
    { value: "₹500 Cr+", label: "Assets Under Management" },
    { value: "15,000+", label: "Happy Investors" },
    { value: "50+", label: "Properties Listed" },
    { value: "8 Cities", label: "Across India" }
  ];

  const certifications = [
    { icon: Shield, label: "Regulated Platform" },
    { icon: Lock, label: "Bank Grade Security" },
    { icon: Award, label: "ISO 27001 Certified" }
  ];

  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About fractOWN</h2>
            <p className="text-lg text-gray-600 mb-6">
              We're democratizing real estate investment in India by making premium properties accessible to everyone. Our mission is to enable wealth creation through fractional property ownership.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Founded by real estate and fintech veterans, fractOWN combines deep market expertise with cutting-edge technology to deliver superior investment experiences.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-fractown-primary">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4">
              {certifications.map((cert, index) => {
                const IconComponent = cert.icon;
                return (
                  <div key={index} className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                    <IconComponent className="text-fractown-primary mr-2 w-5 h-5" />
                    <span className="text-sm font-medium">{cert.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="fractOWN team collaboration"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
            
            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Average Monthly Returns</div>
              <div className="text-2xl font-bold text-fractown-secondary">₹8,500</div>
              <div className="text-sm text-fractown-secondary">Per ₹1 Lakh Invested</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
