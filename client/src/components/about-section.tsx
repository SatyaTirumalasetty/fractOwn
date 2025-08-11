import { useQuery } from "@tanstack/react-query";

export default function AboutSection() {
  // Fetch dynamic about content
  const { data: aboutContent = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/content?section=about_fractOWN"],
  });

  const { data: homeContent = [] } = useQuery<any[]>({
    queryKey: ["/api/content?section=home"],
  });

  if (isLoading) {
    return (
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="grid grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  const getAboutContent = () => {
    const content = aboutContent.find((c: any) => c.key === 'about_fractOWN_content');
    if (!content) return {
      description: "We're democratizing real estate investment in India by making premium properties accessible to everyone.",
      vision: "To become India's leading platform for fractional real estate investment.",
      mission: "To democratize real estate investing by providing transparent, secure, and accessible fractional ownership opportunities."
    };

    const lines = content.content.split('\n').filter((line: string) => line.trim());
    let description = '';
    let vision = '';
    let mission = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes('vision:')) {
        vision = line.replace(/vision:\s*/i, '').trim();
      } else if (line.toLowerCase().includes('mission:')) {
        mission = line.replace(/mission:\s*/i, '').trim();
      } else if (!line.toLowerCase().includes('vision:') && !line.toLowerCase().includes('mission:') && line.trim()) {
        description += (description ? ' ' : '') + line.trim();
      }
    }

    return {
      description: description || "We're democratizing real estate investment in India.",
      vision: vision || "To become India's leading platform for fractional real estate investment.",
      mission: mission || "To democratize real estate investing through accessible opportunities."
    };
  };

  const getHomeStats = () => {
    const content = homeContent.find((c: any) => c.key === 'home_content');
    if (!content) return [
      { value: "₹500 Cr+", label: "Assets Under Management" },
      { value: "15,000+", label: "Happy Investors" },
      { value: "50+", label: "Properties Listed" },
      { value: "8 Cities", label: "Across India" }
    ];

    const lines = content.content.split('\n').filter((line: string) => line.trim());
    const stats = [];
    
    for (const line of lines) {
      if ((line.includes('₹') || line.includes('+') || line.includes('Cities')) && 
          !line.toLowerCase().includes('about') && 
          !line.toLowerCase().includes('statistics:')) {
        const parts = line.split(' ');
        if (parts.length >= 2) {
          const value = parts[0];
          const label = parts.slice(1).join(' ');
          stats.push({ value, label });
        }
      }
    }

    return stats.length > 0 ? stats : [
      { value: "₹500 Cr+", label: "Assets Under Management" },
      { value: "15,000+", label: "Happy Investors" },
      { value: "50+", label: "Properties Listed" },
      { value: "8 Cities", label: "Across India" }
    ];
  };

  const aboutInfo = getAboutContent();
  const stats = getHomeStats();

  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About fractOWN
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {aboutInfo.description}
            </p>
            
            {aboutInfo.vision && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-900 mb-2">Our Vision</h4>
                <p className="text-blue-800">
                  {aboutInfo.vision}
                </p>
              </div>
            )}
            
            {aboutInfo.mission && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-900 mb-2">Our Mission</h4>
                <p className="text-green-800">
                  {aboutInfo.mission}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-fractown-primary">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="fractOWN team collaboration"
              className="rounded-2xl shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
