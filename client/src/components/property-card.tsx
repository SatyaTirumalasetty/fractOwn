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
    <Card className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      <img
        src={property.imageUrls[0]}
        alt={property.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`${getFundingBadgeColor(property.fundingProgress)} text-white`}>
            {getFundingBadgeText(property.fundingProgress)}
          </Badge>
          <span className="text-gray-500 text-sm flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {property.city}, {property.state}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.name}</h3>
        <p className="text-gray-600 mb-4">{property.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-500">Total Value</div>
            <div className="font-semibold text-lg">{formatCurrency(property.totalValue)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Min Investment</div>
            <div className="font-semibold text-lg text-fractown-primary">
              ₹{property.minInvestment.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div>
            <div className="text-sm text-gray-500">Expected Return</div>
            <div className="font-semibold text-fractown-secondary">{property.expectedReturn}% p.a.</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full ${getFundingBadgeColor(property.fundingProgress)}`}
            style={{ width: `${property.fundingProgress}%` }}
          ></div>
        </div>
        
        <Button
          onClick={() => onViewDetails(property.id)}
          disabled={isNearlyDone}
          className={`w-full py-3 font-medium transition-colors ${
            isNearlyDone
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-fractown-primary text-white hover:bg-fractown-primary/90"
          }`}
        >
          {isNearlyDone ? "Nearly Sold Out" : "View Details & Invest"}
        </Button>
      </CardContent>
    </Card>
  );
}
