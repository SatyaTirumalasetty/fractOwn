import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Edit3, Eye, X, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

// Import actual home page components
import HeroSection from "@/components/hero-section";
import TestimonialsSection from "@/components/testimonials-section";
import PropertiesSection from "@/components/properties-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

interface EditableSection {
  id: string;
  title: string;
  component: string;
  editMode: boolean;
}

export default function WYSIWYGHomeEditor() {
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const [sectionContent, setSectionContent] = useState<Record<string, any>>({});
  const [tempContent, setTempContent] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Fetch all content data
  const { data: contentData, isLoading } = useQuery<any[]>({
    queryKey: ['/api/content'],
    refetchOnMount: true,
  });

  // Fetch properties and contact data
  const { data: propertiesData } = useQuery<any[]>({
    queryKey: ['/api/properties'],
  });

  const { data: contactData } = useQuery<any>({
    queryKey: ['/api/contact-info'],
  });

  useEffect(() => {
    if (contentData && Array.isArray(contentData)) {
      const contentMap: Record<string, any> = {};
      
      contentData.forEach((item: any) => {
        if (item.key === 'home_content') {
          // Parse statistics format
          const stats = item.content.split('\n').map((line: string) => {
            const match = line.match(/^• (.+): (.+)$/);
            return match ? { value: match[1], label: match[2] } : null;
          }).filter(Boolean);
          contentMap[item.key] = stats;
        } else if (item.key === 'testimonials_content') {
          try {
            contentMap[item.key] = JSON.parse(item.content);
          } catch {
            contentMap[item.key] = [];
          }
        } else {
          contentMap[item.key] = item.content;
        }
      });
      
      setSectionContent(contentMap);
    }
  }, [contentData]);

  const toggleEdit = (sectionKey: string) => {
    setEditingSections(prev => {
      const newState = { ...prev, [sectionKey]: !prev[sectionKey] };
      
      // If entering edit mode, store current content as temp
      if (newState[sectionKey]) {
        setTempContent(prev => ({ ...prev, [sectionKey]: sectionContent[sectionKey] }));
      }
      
      return newState;
    });
  };

  const cancelEdit = (sectionKey: string) => {
    setEditingSections(prev => ({ ...prev, [sectionKey]: false }));
    setTempContent(prev => ({ ...prev, [sectionKey]: sectionContent[sectionKey] }));
  };

  const saveSection = async (sectionKey: string) => {
    try {
      const content = tempContent[sectionKey];
      let contentToSave = content;
      
      // Format content based on section type
      if (sectionKey === 'home_content') {
        contentToSave = content.map((stat: any) => `• ${stat.value}: ${stat.label}`).join('\n');
      } else if (sectionKey === 'testimonials_content') {
        contentToSave = JSON.stringify(content);
      }

      await apiRequest(`/api/admin/content/key/${sectionKey}`, 'PUT', { content: contentToSave });
      
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      setSectionContent(prev => ({ ...prev, [sectionKey]: content }));
      setEditingSections(prev => ({ ...prev, [sectionKey]: false }));
      
      toast({
        title: "Section Updated",
        description: "Changes saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateTempContent = (sectionKey: string, newContent: any) => {
    setTempContent(prev => ({ ...prev, [sectionKey]: newContent }));
  };

  // Wrapper component for editable sections
  const EditableWrapper = ({ 
    sectionKey, 
    title, 
    children, 
    className = "" 
  }: { 
    sectionKey: string; 
    title: string; 
    children: React.ReactNode;
    className?: string;
  }) => {
    const isEditing = editingSections[sectionKey];
    
    return (
      <div className={`relative group ${className}`}>
        {/* Edit Overlay */}
        {!isEditing && (
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border-2 border-transparent group-hover:border-blue-500 rounded-lg">
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                onClick={() => toggleEdit(sectionKey)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit {title}
              </Button>
            </div>
          </div>
        )}
        
        {/* Edit Controls */}
        {isEditing && (
          <div className="absolute top-2 right-2 z-20 flex space-x-2">
            <Button
              size="sm"
              onClick={() => saveSection(sectionKey)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cancelEdit(sectionKey)}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}
        
        {children}
      </div>
    );
  };

  // Custom editable components
  const EditableHeroSection = () => {
    const isEditing = editingSections['hero_content'];
    const content = isEditing ? tempContent['hero_content'] : sectionContent['hero_content'];
    
    if (isEditing) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
              <Label>Hero Content</Label>
              <Textarea
                value={content || ''}
                onChange={(e) => updateTempContent('hero_content', e.target.value)}
                className="min-h-[120px] text-center text-lg"
                placeholder="Enter hero section content..."
              />
            </div>
          </div>
        </div>
      );
    }
    
    return <HeroSection />;
  };

  const EditableStatisticsSection = () => {
    const isEditing = editingSections['home_content'];
    const stats = isEditing ? tempContent['home_content'] : sectionContent['home_content'];
    
    if (isEditing) {
      return (
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
            <div className="space-y-4">
              {(stats || []).map((stat: any, index: number) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-3 border rounded">
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...(stats || [])];
                        newStats[index] = { ...newStats[index], value: e.target.value };
                        updateTempContent('home_content', newStats);
                      }}
                      placeholder="₹500 Cr+"
                    />
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...(stats || [])];
                        newStats[index] = { ...newStats[index], label: e.target.value };
                        updateTempContent('home_content', newStats);
                      }}
                      placeholder="Assets Under Management"
                    />
                  </div>
                </div>
              ))}
              <Button
                onClick={() => {
                  const newStats = [...(stats || []), { value: '', label: '' }];
                  updateTempContent('home_content', newStats);
                }}
                variant="outline"
                size="sm"
              >
                Add Statistic
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {(stats || []).map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const EditableTestimonialsSection = () => {
    const isEditing = editingSections['testimonials_content'];
    const testimonials = isEditing ? tempContent['testimonials_content'] : sectionContent['testimonials_content'];
    
    if (isEditing) {
      return (
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
            <div className="space-y-6">
              {(testimonials || []).map((testimonial: any, index: number) => (
                <div key={testimonial.id || index} className="p-4 bg-white border rounded-lg">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => {
                          const newTestimonials = [...(testimonials || [])];
                          newTestimonials[index] = { ...newTestimonials[index], name: e.target.value };
                          updateTempContent('testimonials_content', newTestimonials);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={testimonial.title}
                        onChange={(e) => {
                          const newTestimonials = [...(testimonials || [])];
                          newTestimonials[index] = { ...newTestimonials[index], title: e.target.value };
                          updateTempContent('testimonials_content', newTestimonials);
                        }}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <Label>Review</Label>
                    <Textarea
                      value={testimonial.content}
                      onChange={(e) => {
                        const newTestimonials = [...(testimonials || [])];
                        newTestimonials[index] = { ...newTestimonials[index], content: e.target.value };
                        updateTempContent('testimonials_content', newTestimonials);
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Label className="mr-2">Rating:</Label>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 cursor-pointer ${
                              star <= testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                            onClick={() => {
                              const newTestimonials = [...(testimonials || [])];
                              newTestimonials[index] = { ...newTestimonials[index], rating: star };
                              updateTempContent('testimonials_content', newTestimonials);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newTestimonials = (testimonials || []).filter((_: any, i: number) => i !== index);
                        updateTempContent('testimonials_content', newTestimonials);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => {
                  const newTestimonials = [...(testimonials || []), {
                    id: Date.now().toString(),
                    name: '',
                    title: '',
                    content: '',
                    rating: 5
                  }];
                  updateTempContent('testimonials_content', newTestimonials);
                }}
                variant="outline"
              >
                Add Testimonial
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return <TestimonialsSection />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          Loading home page editor...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Home Page Live Editor</span>
          <Badge variant="secondary">WYSIWYG Mode</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          This is the exact view users see. Hover over any section and click "Edit" to modify content.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border rounded-lg overflow-hidden bg-white">
          {/* Hero Section */}
          <EditableWrapper sectionKey="hero_content" title="Hero">
            <EditableHeroSection />
          </EditableWrapper>

          {/* Statistics Section */}
          <EditableWrapper sectionKey="home_content" title="Statistics">
            <EditableStatisticsSection />
          </EditableWrapper>

          {/* Testimonials Section */}
          <EditableWrapper sectionKey="testimonials_content" title="Testimonials">
            <EditableTestimonialsSection />
          </EditableWrapper>

          {/* Properties Section (Read-only) */}
          <div className="relative">
            <div className="absolute inset-0 bg-gray-100/50 z-10 flex items-center justify-center">
              <Badge variant="secondary">Properties managed in Properties tab</Badge>
            </div>
            <PropertiesSection />
          </div>

          {/* Contact Section (Read-only) */}
          <div className="relative">
            <div className="absolute inset-0 bg-gray-100/50 z-10 flex items-center justify-center">
              <Badge variant="secondary">Contact info managed in Settings</Badge>
            </div>
            <ContactSection />
          </div>

          {/* Footer (Read-only) */}
          <div className="relative">
            <div className="absolute inset-0 bg-gray-100/50 z-10 flex items-center justify-center">
              <Badge variant="secondary">Footer content managed in Content Editor</Badge>
            </div>
            <Footer />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}