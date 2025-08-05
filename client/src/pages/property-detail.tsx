import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowLeft, ChevronLeft, ChevronRight, Building, TrendingUp, Calendar, Users } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Property } from "@shared/schema";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Enable real-time updates
  useRealtimeUpdates();

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["/api/properties", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.imageUrls.length - 1 : prev - 1
    );
  };

  const isNearlyDone = property.fundingProgress >= 95;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <ImageCarousel 
              images={property.imageUrls} 
              alt={property.name}
              className="w-full h-96"
            />
          </div>

          {/* Property Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge className={`${getFundingBadgeColor(property.fundingProgress)} text-white`}>
                  {property.fundingProgress >= 95 ? "Nearly Sold Out" : `${property.fundingProgress}% Funded`}
                </Badge>
                <span className="text-gray-500 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.city}, {property.state}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <p className="text-gray-600 text-lg">{property.description}</p>
            </div>

            {/* Investment Details */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(property.totalValue)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Min Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-fractown-primary">
                    ₹{property.minInvestment.toLocaleString('en-IN')}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Expected Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-fractown-secondary">{property.expectedReturn}% p.a.</div>
              </CardContent>
            </Card>

            {/* Funding Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Funding Progress</span>
                <span className="text-sm font-medium">{property.fundingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getFundingBadgeColor(property.fundingProgress)}`}
                  style={{ width: `${property.fundingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Property Type */}
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">Property Type:</span>
              <Badge variant="outline" className="capitalize">
                {property.propertyType}
              </Badge>
            </div>

            {/* Investment Button */}
            <Button
              disabled={isNearlyDone}
              className={`w-full py-4 text-lg font-medium transition-colors ${
                isNearlyDone
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-fractown-primary text-white hover:bg-fractown-primary/90"
              }`}
            >
              {isNearlyDone ? "Nearly Sold Out" : "Invest Now"}
            </Button>

            {/* Investment Benefits */}
            <Card className="bg-fractown-primary/5 border-fractown-primary/20">
              <CardHeader>
                <CardTitle className="text-fractown-primary flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Investment Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-fractown-secondary" />
                  <span className="text-sm">Expected return: {property.expectedReturn}% per annum</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-fractown-secondary" />
                  <span className="text-sm">Minimum investment: ₹{property.minInvestment.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-fractown-secondary" />
                  <span className="text-sm">Prime {property.propertyType} property</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Property Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>About This Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                  <p className="text-gray-600">{property.location}, {property.city}, {property.state}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Property Type</h4>
                  <p className="text-gray-600 capitalize">{property.propertyType}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Total Value</h4>
                  <p className="text-gray-600">{formatCurrency(property.totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Expected Annual Return</h4>
                  <p className="text-fractown-secondary font-semibold">{property.expectedReturn}%</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Minimum Investment</h4>
                  <p className="text-fractown-primary font-semibold">₹{property.minInvestment.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Funding Status</h4>
                  <p className="text-gray-600">{property.fundingProgress}% of target reached</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}