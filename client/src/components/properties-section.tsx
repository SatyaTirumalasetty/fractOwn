import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import PropertyCard from "./property-card";
import type { Property } from "@shared/schema";
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";

export default function PropertiesSection() {
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [, setLocation] = useLocation();
  
  // Enable real-time updates
  useRealtimeUpdates();

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Dynamically generate city tabs based on actual property data
  const availableCities = useMemo(() => {
    if (!properties || properties.length === 0) return ["All Properties"];
    
    const citySet = new Set(properties.map(property => property.city));
    const uniqueCities = Array.from(citySet);
    return ["All Properties", ...uniqueCities.sort()];
  }, [properties]);

  const filteredProperties = properties?.filter(property => {
    if (selectedCity === "all") return true;
    return property.city.toLowerCase() === selectedCity.toLowerCase();
  }) || [];

  const handleViewDetails = (id: string) => {
    setLocation(`/property/${id}`);
    // Scroll to top when navigating to property detail page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleCityFilter = (city: string) => {
    setSelectedCity(city === "All Properties" ? "all" : city);
  };

  if (isLoading) {
    return (
      <section id="properties" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fractown-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="properties" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-fractown-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-fractown-accent/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Investment Properties
          </h2>
          <p className="text-xl text-gray-600">
            Handpicked premium properties across major Indian cities
          </p>
        </div>
        
        {/* Enhanced City Filters with modern design */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {availableCities.map((city, index) => (
            <Button
              key={city}
              onClick={() => handleCityFilter(city)}
              variant={selectedCity === (city === "All Properties" ? "all" : city.toLowerCase()) ? "default" : "outline"}
              className={`px-6 py-3 rounded-full text-sm font-medium transform transition-all duration-300 hover:scale-105 ${
                selectedCity === (city === "All Properties" ? "all" : city.toLowerCase())
                  ? "bg-fractown-primary text-white shadow-lg"
                  : "bg-white text-gray-600 border hover:bg-fractown-primary hover:text-white hover:border-fractown-primary"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {city}
            </Button>
          ))}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
        
        {filteredProperties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No properties found for the selected city.</p>
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="bg-white text-fractown-primary border-fractown-primary px-8 py-4 text-lg font-semibold hover:bg-fractown-primary hover:text-white"
          >
            View All Properties
          </Button>
        </div>
      </div>
    </section>
  );
}
