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
  
  useRealtimeUpdates();

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

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
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleCityFilter = (city: string) => {
    setSelectedCity(city === "All Properties" ? "all" : city);
  };

  if (isLoading) {
    return (
      <section id="properties" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="properties" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Investment Properties
          </h2>
          <p className="text-xl text-gray-600">
            Handpicked premium properties across major Indian cities
          </p>
        </div>

        {availableCities.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {availableCities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === (city === "All Properties" ? "all" : city) ? "default" : "outline"}
                className={`px-4 py-2 text-sm ${
                  selectedCity === (city === "All Properties" ? "all" : city)
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => handleCityFilter(city)}
              >
                {city}
              </Button>
            ))}
          </div>
        )}

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
            <p className="text-xl text-gray-500">No properties found for {selectedCity === "all" ? "this filter" : selectedCity}.</p>
          </div>
        )}
      </div>
    </section>
  );
}