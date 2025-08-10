import { useState } from "react";
import * as React from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowLeft, ChevronLeft, ChevronRight, Building, TrendingUp, Calendar, Users, FileText, Download, ExternalLink } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { Property } from "@shared/schema";
import { PropertyImageCarousel } from "@/components/property-image-carousel";
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";
import { FIELD_SECTIONS, SECTION_CONFIG, FIELD_TYPE_CONFIG, PRODUCTION_SAFETY_CONFIG, type CustomField } from "@shared/propertyTypes";

export default function PropertyDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageCarousel, setShowImageCarousel] = useState(false);
  
  // Enable real-time updates
  useRealtimeUpdates();
  
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ["/api/properties", id],
    enabled: !!id,
  });
  
  // Debug logging
  React.useEffect(() => {
    console.log("Property Detail Debug:", { id, property, isLoading, error });
  }, [id, property, isLoading, error]);



  if (!property) {
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
    
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-4">Property ID: {id}</p>
            {error && <p className="text-red-600 mb-4">Error: {String(error)}</p>}
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
          onClick={() => {
            setLocation("/");
            // Small delay to ensure navigation completes before scrolling
            setTimeout(() => {
              const propertiesSection = document.getElementById('properties');
              if (propertiesSection) {
                propertiesSection.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }, 100);
          }}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery - Only show images, not documents */}
          <div className="space-y-4">
            {(() => {
              // Get only image URLs, filtering out document attachments from imageUrls
              const imageUrls = Array.isArray(property.imageUrls) ? property.imageUrls : [];
              const imageAttachments = (property.attachments || []).filter((att: any) => 
                att.type === 'image'
              ).map((att: any) => att.url);
              
              // Combine manual imageUrls with image attachments, removing duplicates
              const combinedImages = [...imageUrls, ...imageAttachments];
              const allImages = Array.from(new Set(combinedImages)).filter(url => url && url.trim().length > 0);
              
              console.log('Property imageUrls:', imageUrls);
              console.log('Image attachments:', imageAttachments);
              console.log('Combined images:', allImages);
              
              if (allImages.length === 0) {
                return (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">No images available</p>
                  </div>
                );
              }

              return (
                <>
                  <div className="relative group cursor-pointer">
                    <img
                      src={allImages[currentImageIndex]}
                      alt={`${property.name} - Image ${currentImageIndex + 1}`}
                      data-testid={`img-property-main-${currentImageIndex}`}
                      className="w-full h-96 object-cover rounded-lg shadow-lg transition-transform group-hover:scale-105"
                      onClick={() => setShowImageCarousel(true)}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        console.error("Failed to load image:", allImages[currentImageIndex]);
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
                      }}
                    />
                    
                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                    
                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid="button-previous-main"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) => 
                              prev === 0 ? allImages.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid="button-next-main"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) => 
                              prev === allImages.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </>
                    )}
                    
                    {/* Click to expand hint */}
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view gallery
                    </div>
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          data-testid={`button-thumbnail-main-${index}`}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex 
                              ? "border-fractown-primary scale-110" 
                              : "border-gray-200 hover:border-fractown-accent"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${property.name} - Thumbnail ${index + 1}`}
                            data-testid={`img-thumbnail-main-${index}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
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

            {/* Property Documents - Only show non-image documents */}
            {(() => {
              const documents = (property.attachments || []).filter((att: any) => 
                att.type !== 'image'
              );
              
              if (documents.length === 0) return null;

              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Property Documents
                    </CardTitle>
                    <CardDescription>
                      Download important documents related to this property
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {documents.map((attachment: any, index: number) => {
                        const getFileIcon = (type: string) => {
                          if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
                          if (type.includes('doc')) return <FileText className="w-5 h-5 text-blue-500" />;
                          return <FileText className="w-5 h-5 text-gray-500" />;
                        };

                        const getFileTypeLabel = (type: string) => {
                          if (type.includes('pdf')) return 'PDF Document';
                          if (type.includes('doc')) return 'Word Document';
                          return 'Document';
                        };

                        return (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(attachment.type)}
                              <div>
                                <p className="font-medium text-gray-900">{attachment.name}</p>
                                <p className="text-sm text-gray-500">{getFileTypeLabel(attachment.type)}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(attachment.url, '_blank')}
                                className="text-sm"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = attachment.url;
                                  link.download = attachment.name;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="text-sm"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </div>

        {/* Custom Fields Display by Section */}
        {property.customFields && Object.keys(property.customFields).length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Property Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(SECTION_CONFIG).map(([sectionKey, sectionConfig]) => {
                // Load field definitions from environment-specific localStorage to get proper display names
                const storageKey = PRODUCTION_SAFETY_CONFIG.getCustomFieldStorageKey();
                const savedDefinitions = localStorage.getItem(storageKey);
                let fieldDefinitions: CustomField[] = [];
                if (savedDefinitions) {
                  try {
                    fieldDefinitions = JSON.parse(savedDefinitions);
                  } catch (error) {
                    console.error('Failed to load custom field definitions:', error);
                  }
                }

                // Filter custom fields for this section based on field definitions
                const sectionFields = Object.entries(property.customFields || {})
                  .map(([fieldKey, value]) => {
                    // Find the field definition to get the proper display name
                    const fieldDef = fieldDefinitions.find(def => def.id === fieldKey);
                    return { fieldKey, value, definition: fieldDef };
                  })
                  .filter(({ definition, value }) => 
                    definition && 
                    definition.section === sectionKey && 
                    value !== null && 
                    value !== undefined && 
                    value !== ''
                  );

                if (sectionFields.length === 0) return null;

                return (
                  <Card key={sectionKey} className="h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="text-xl">{sectionConfig.icon}</span>
                        {sectionConfig.label}
                      </CardTitle>
                      <CardDescription>{sectionConfig.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sectionFields.map(({ fieldKey, value, definition }) => (
                          <div key={fieldKey}>
                            <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                              <span>{FIELD_TYPE_CONFIG[definition?.type as keyof typeof FIELD_TYPE_CONFIG]?.icon || '📝'}</span>
                              {definition?.displayName || fieldKey.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <p className="text-gray-600">
                              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                               typeof value === 'number' ? value.toLocaleString('en-IN') :
                               String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Standard Property Information */}
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

        {/* Image Carousel Modal */}
        <PropertyImageCarousel
          images={[
            ...(property.imageUrls || []),
            ...((property.attachments || []).filter((att: any) => att.type.startsWith('image/')).map((att: any) => att.url))
          ].filter(Boolean)}
          propertyName={property.name}
          isOpen={showImageCarousel}
          onClose={() => setShowImageCarousel(false)}
          initialIndex={currentImageIndex}
        />
      </main>

      <Footer />
    </div>
  );
}