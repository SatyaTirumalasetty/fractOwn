import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Edit3, Eye, Home, BarChart3, MessageSquare, Star, Users, Building, Mail, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface HomePageSection {
  key: string;
  title: string;
  description: string;
  icon: any;
  content: any;
  editable: boolean;
}

export default function HomePageLiveEditor() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch all content data
  const { data: contentData, isLoading } = useQuery<any[]>({
    queryKey: ['/api/content'],
    refetchOnMount: true,
  });

  // Fetch properties for preview
  const { data: propertiesData } = useQuery<any[]>({
    queryKey: ['/api/properties'],
  });

  // Fetch contact info
  const { data: contactData } = useQuery<any>({
    queryKey: ['/api/contact-info'],
  });

  // Define all home page sections
  const homePageSections: HomePageSection[] = [
    {
      key: "hero_content",
      title: "Hero Section",
      description: "Main headline, tagline, and call-to-action",
      icon: Home,
      content: {},
      editable: true
    },
    {
      key: "home_content",
      title: "Statistics Section", 
      description: "Key performance numbers and metrics",
      icon: BarChart3,
      content: {},
      editable: true
    },
    {
      key: "about_content",
      title: "About Section",
      description: "Company description and mission",
      icon: Info,
      content: {},
      editable: true
    },
    {
      key: "testimonials_content",
      title: "Customer Testimonials",
      description: "Client reviews and ratings",
      icon: MessageSquare,
      content: {},
      editable: true
    },
    {
      key: "how_it_works_content",
      title: "How It Works",
      description: "Step-by-step process explanation",
      icon: Users,
      content: {},
      editable: true
    },
    {
      key: "properties_section",
      title: "Properties Showcase",
      description: "Featured properties and listings",
      icon: Building,
      content: propertiesData || [],
      editable: false
    },
    {
      key: "contact_section",
      title: "Contact Information",
      description: "Contact details and form",
      icon: Mail,
      content: contactData || {},
      editable: false
    }
  ];

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
      
      setSectionData(contentMap);
    }
  }, [contentData]);

  const handleEditSection = (sectionKey: string) => {
    setEditingSection(sectionKey);
  };

  const handleSaveSection = async (sectionKey: string, newContent: any) => {
    setIsSaving(true);
    try {
      let contentToSave = newContent;
      
      // Format content based on section type
      if (sectionKey === 'home_content') {
        contentToSave = newContent.map((stat: any) => `• ${stat.value}: ${stat.label}`).join('\n');
      } else if (sectionKey === 'testimonials_content') {
        contentToSave = JSON.stringify(newContent);
      }

      await apiRequest(`/api/admin/content/key/${sectionKey}`, 'PUT', { content: contentToSave });
      
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      
      setSectionData(prev => ({ ...prev, [sectionKey]: newContent }));
      setEditingSection(null);
      
      toast({
        title: "Section Updated",
        description: `${homePageSections.find(s => s.key === sectionKey)?.title} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save section. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSectionPreview = (section: HomePageSection) => {
    const content = sectionData[section.key] || section.content;
    
    switch (section.key) {
      case 'home_content':
        return (
          <div className="grid grid-cols-2 gap-4">
            {Array.isArray(content) && content.map((stat: any, idx: number) => (
              <div key={idx} className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        );
      
      case 'testimonials_content':
        return (
          <div className="space-y-3">
            {Array.isArray(content) && content.slice(0, 2).map((testimonial: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="font-medium">{testimonial.name}</span>
                  <div className="flex ml-2">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{testimonial.content}</p>
              </div>
            ))}
          </div>
        );
      
      case 'properties_section':
        return (
          <div className="text-sm text-gray-600">
            <p>{Array.isArray(content) ? content.length : 0} properties listed</p>
            <p className="text-xs mt-1">Managed in Properties section</p>
          </div>
        );
      
      case 'contact_section':
        return (
          <div className="text-sm text-gray-600">
            <p>Phone: {content.phone || 'Not set'}</p>
            <p>Email: {content.email || 'Not set'}</p>
            <p className="text-xs mt-1">Managed in Contact section</p>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-gray-600">
            <p className="line-clamp-3">{typeof content === 'string' ? content : 'Content available'}</p>
          </div>
        );
    }
  };

  const renderSectionEditor = (section: HomePageSection) => {
    const content = sectionData[section.key] || section.content;
    
    switch (section.key) {
      case 'home_content':
        return <StatisticsEditor content={content} onSave={(newContent) => handleSaveSection(section.key, newContent)} />;
      
      case 'testimonials_content':
        return <TestimonialsEditor content={content} onSave={(newContent) => handleSaveSection(section.key, newContent)} />;
      
      default:
        return <TextEditor content={content} onSave={(newContent) => handleSaveSection(section.key, newContent)} />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Home Page Live Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading home page content...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Home className="w-5 h-5 mr-2" />
          Home Page Live Editor
          <Badge variant="secondary" className="ml-2">Live Preview</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Click on any section to edit its content. Changes are applied immediately to the home page.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {homePageSections.map((section) => {
            const IconComponent = section.icon;
            const isEditing = editingSection === section.key;
            
            return (
              <Card key={section.key} className={`transition-all ${isEditing ? 'ring-2 ring-orange-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IconComponent className="w-5 h-5 mr-2 text-orange-600" />
                      <div>
                        <h3 className="font-medium">{section.title}</h3>
                        <p className="text-xs text-gray-500">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {section.editable && (
                        <>
                          {isEditing ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSection(null)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSection(section.key)}
                            >
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </>
                      )}
                      {!section.editable && (
                        <Badge variant="secondary" className="text-xs">View Only</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {isEditing ? renderSectionEditor(section) : renderSectionPreview(section)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Statistics Editor Component
function StatisticsEditor({ content, onSave }: { content: any[], onSave: (content: any[]) => void }) {
  const [stats, setStats] = useState(content || []);

  const addStat = () => {
    setStats(prev => [...prev, { value: "", label: "" }]);
  };

  const removeStat = (index: number) => {
    setStats(prev => prev.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, field: 'value' | 'label', newValue: string) => {
    setStats(prev => prev.map((stat, i) => 
      i === index ? { ...stat, [field]: newValue } : stat
    ));
  };

  return (
    <div className="space-y-4">
      {stats.map((stat, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 p-3 border rounded-lg">
          <div>
            <Label className="text-xs">Value</Label>
            <Input
              value={stat.value}
              onChange={(e) => updateStat(index, 'value', e.target.value)}
              placeholder="₹500 Cr+"
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Label</Label>
            <div className="flex">
              <Input
                value={stat.label}
                onChange={(e) => updateStat(index, 'label', e.target.value)}
                placeholder="Assets Under Management"
                className="h-8"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeStat(index)}
                className="ml-2 h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-between">
        <Button size="sm" variant="outline" onClick={addStat}>
          Add Statistic
        </Button>
        <Button size="sm" onClick={() => onSave(stats)}>
          <Save className="w-4 h-4 mr-1" />
          Save Statistics
        </Button>
      </div>
    </div>
  );
}

// Testimonials Editor Component  
function TestimonialsEditor({ content, onSave }: { content: any[], onSave: (content: any[]) => void }) {
  const [testimonials, setTestimonials] = useState(content || []);

  const addTestimonial = () => {
    setTestimonials(prev => [...prev, {
      id: Date.now().toString(),
      name: "",
      title: "",
      location: "",
      content: "",
      rating: 5
    }]);
  };

  const removeTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const updateTestimonial = (id: string, field: string, value: any) => {
    setTestimonials(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  return (
    <div className="space-y-4">
      {testimonials.map((testimonial, index) => (
        <div key={testimonial.id} className="p-4 border rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Name</Label>
              <Input
                value={testimonial.name}
                onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                placeholder="Customer Name"
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Title</Label>
              <Input
                value={testimonial.title}
                onChange={(e) => updateTestimonial(testimonial.id, 'title', e.target.value)}
                placeholder="Job Title"
                className="h-8"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Location</Label>
            <Input
              value={testimonial.location}
              onChange={(e) => updateTestimonial(testimonial.id, 'location', e.target.value)}
              placeholder="City, State"
              className="h-8"
            />
          </div>
          
          <div>
            <Label className="text-xs">Review</Label>
            <Textarea
              value={testimonial.content}
              onChange={(e) => updateTestimonial(testimonial.id, 'content', e.target.value)}
              placeholder="Customer review..."
              className="h-20"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Label className="text-xs mr-2">Rating:</Label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 cursor-pointer ${
                      star <= testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                    onClick={() => updateTestimonial(testimonial.id, 'rating', star)}
                  />
                ))}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => removeTestimonial(testimonial.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      
      <div className="flex justify-between">
        <Button size="sm" variant="outline" onClick={addTestimonial}>
          Add Testimonial
        </Button>
        <Button size="sm" onClick={() => onSave(testimonials)}>
          <Save className="w-4 h-4 mr-1" />
          Save Testimonials
        </Button>
      </div>
    </div>
  );
}

// Text Editor Component
function TextEditor({ content, onSave }: { content: string, onSave: (content: string) => void }) {
  const [text, setText] = useState(content || "");

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter content..."
        className="min-h-[120px]"
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => onSave(text)}>
          <Save className="w-4 h-4 mr-1" />
          Save Content
        </Button>
      </div>
    </div>
  );
}