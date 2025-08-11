import { useQuery } from "@tanstack/react-query";

export default function AboutSection() {
  // Fetch dynamic about content
  const { data: aboutContent = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/content?section=about_fractOWN"],
  });

  const stats = [
    { value: "₹500 Cr+", label: "Assets Under Management" },
    { value: "15,000+", label: "Happy Investors" },
    { value: "50+", label: "Properties Listed" },
    { value: "8 Cities", label: "Across India" }
  ];

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

  const getContentValue = (key: string, fallback: string) => {
    const content = aboutContent.find((c: any) => c.key === key);
    return content?.content || fallback;
  };

  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {getContentValue('about_fractOWN_title', 'About fractOWN')}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {getContentValue('about_fractOWN_description', 'We\'re democratizing real estate investment in India by making premium properties accessible to everyone.')}
            </p>
            
            {getContentValue('about_fractOWN_vision', '') && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-900 mb-2">Our Vision</h4>
                <p className="text-blue-800">
                  {getContentValue('about_fractOWN_vision', '')}
                </p>
              </div>
            )}
            
            {getContentValue('about_fractOWN_mission', '') && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-900 mb-2">Our Mission</h4>
                <p className="text-green-800">
                  {getContentValue('about_fractOWN_mission', '')}
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
