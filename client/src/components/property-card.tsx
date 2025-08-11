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

  // Get the first available image from either imageUrls or image attachments
  const getFirstImage = () => {
    // Check imageUrls first
    if (property.imageUrls && property.imageUrls.length > 0 && property.imageUrls[0]) {
      return property.imageUrls[0];
    }
    
    // Check image attachments
    if (property.attachments && Array.isArray(property.attachments)) {
      const imageAttachment = property.attachments.find((att: any) => 
        att.type === 'image' && att.url
      );
      if (imageAttachment) {
        return imageAttachment.url;
      }
    }
    
    // Fallback to placeholder
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
  };

  return (
    <Card className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-fractown-primary/10 transition-all duration-500 overflow-hidden border border-gray-100/50 hover:border-fractown-primary/20 transform hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <img
          src={getFirstImage()}
          alt={property.name}
          className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Badge className={`${getFundingBadgeColor(property.fundingProgress)} text-white px-3 py-1.5 rounded-full font-medium shadow-lg backdrop-blur-sm`}>
            {getFundingBadgeText(property.fundingProgress)}
          </Badge>
          <div className="bg-white/90 backdrop-blur-sm text-gray-700 text-sm flex items-center px-3 py-1.5 rounded-full shadow-lg">
            <MapPin className="w-4 h-4 mr-1.5 text-fractown-primary" />
            {property.city}, {property.state}
          </div>
        </div>
        {property.fundingProgress >= 90 && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 animate-pulse"></div>
        )}
      </div>
      
      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-fractown-primary transition-colors duration-300">
            {property.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {property.description}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50/80 rounded-2xl p-4 hover:bg-fractown-primary/5 transition-colors duration-300">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Value</div>
            <div className="font-bold text-lg text-gray-900">{formatCurrency(property.totalValue)}</div>
          </div>
          <div className="bg-fractown-primary/5 rounded-2xl p-4 hover:bg-fractown-primary/10 transition-colors duration-300">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Min Investment</div>
            <div className="font-bold text-lg text-fractown-primary">
              ₹{property.minInvestment.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-fractown-secondary/10 to-fractown-accent/10 rounded-2xl p-4 text-center">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Expected Return</div>
          <div className="font-bold text-2xl bg-gradient-to-r from-fractown-secondary to-fractown-accent bg-clip-text text-transparent">
            {property.expectedReturn}% p.a.
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Funding Progress</span>
            <span className="font-bold text-gray-900">{property.fundingProgress}%</span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out relative ${getFundingBadgeColor(property.fundingProgress)}`}
              style={{ width: `${property.fundingProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => onViewDetails(property.id)}
          disabled={isNearlyDone}
          className={`w-full py-4 font-semibold text-sm uppercase tracking-wide rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
            isNearlyDone
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-fractown-primary to-blue-600 text-white hover:from-fractown-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl hover:shadow-fractown-primary/25"
          }`}
        >
          {isNearlyDone ? "Nearly Sold Out" : "View Details & Invest"}
        </Button>
      </CardContent>
    </Card>
  );
}
