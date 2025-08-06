import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  onViewDetails: (id: string) => void;
}

export default function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const getFundingBadgeColor = (progress: number) => {
    if (progress >= 90) return "bg-red-500";
    if (progress >= 70) return "bg-fractown-secondary";
    if (progress >= 40) return "bg-fractown-accent";
    return "bg-blue-500";
  };

  const getFundingBadgeText = (progress: number) => {
    if (progress >= 95) return "Nearly Sold Out";
    return `${progress}% Funded`;
  };

  const isNearlyDone = property.fundingProgress >= 95;

  return (
    <Card className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:scale-[1.02] overflow-hidden border border-gray-100 relative">
      {/* Image with overlay effects */}
      <div className="relative overflow-hidden">
        <img
          src={property.imageUrls[0]}
          alt={property.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Floating funding badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getFundingBadgeColor(property.fundingProgress)} text-white shadow-lg animate-pulse`}>
            {getFundingBadgeText(property.fundingProgress)}
          </Badge>
        </div>
        
        {/* Location badge */}
        <div className="absolute top-4 right-4">
          <span className="text-white text-sm flex items-center bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <MapPin className="w-4 h-4 mr-1" />
            {property.city}, {property.state}
          </span>
        </div>
      </div>

      <CardContent className="p-6 relative">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-fractown-primary transition-colors duration-300">{property.name}</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{property.description}</p>
          
          {/* Enhanced stats grid with proper colors */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Value</div>
              <div className="font-semibold text-lg">{formatCurrency(property.totalValue)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Min Investment</div>
              <div className="font-semibold text-lg text-fractown-primary">
                ₹{property.minInvestment.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          
          {/* Enhanced return display with proper colors */}
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500">Expected Return</div>
            <div className="font-semibold text-fractown-secondary">{property.expectedReturn}% p.a.</div>
          </div>
        
          {/* Enhanced progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Funding Progress</span>
              <span className="font-semibold">{property.fundingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full ${getFundingBadgeColor(property.fundingProgress)} transform transition-all duration-1000 ease-out shadow-sm`}
                style={{ width: `${property.fundingProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Enhanced CTA button */}
          <Button
            onClick={() => onViewDetails(property.id)}
            disabled={isNearlyDone}
            className={`w-full py-3 font-medium transform transition-all duration-300 hover:scale-105 ${
              isNearlyDone
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-fractown-primary text-white hover:bg-fractown-primary/90 hover:shadow-lg"
            }`}
          >
            {isNearlyDone ? "Nearly Sold Out" : "View Details & Invest"}
            {!isNearlyDone && <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
