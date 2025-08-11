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
    <section id="properties" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Investment Properties
          </h2>
          <p className="text-xl text-gray-600">
            Handpicked premium properties across major Indian cities
          </p>
        </div>
        
        {/* Modern City Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {availableCities.map((city, index) => {
            const isSelected = selectedCity === (city === "All Properties" ? "all" : city.toLowerCase());
            return (
              <Button
                key={city}
                onClick={() => handleCityFilter(city)}
                variant={isSelected ? "default" : "outline"}
                className={`group relative px-8 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  isSelected
                    ? "bg-gradient-to-r from-fractown-primary to-blue-600 text-white shadow-lg shadow-fractown-primary/25 border-0"
                    : "bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-fractown-primary/50 hover:text-fractown-primary hover:bg-fractown-primary/5"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {city === "All Properties" && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                  {city !== "All Properties" && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  {city}
                </span>
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-fractown-primary/20 to-blue-600/20 rounded-2xl blur-xl -z-10 group-hover:blur-2xl transition-all duration-300"></div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            );
          })}
        </div>

        {/* Modern Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {filteredProperties.map((property, index) => (
            <div
              key={property.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              <PropertyCard
                property={property}
                onViewDetails={handleViewDetails}
              />
            </div>
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
