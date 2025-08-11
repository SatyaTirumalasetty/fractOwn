import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, FileText, Home, AlertTriangle, Info, Eye, Edit, BarChart3 } from "lucide-react";

interface ContentSection {
  id: string;
  key: string;
  title: string;
  content: string;
  contentType: string;
  section: string;
  isActive: boolean;
  displayOrder: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const SECTIONS = [
  { 
    key: 'home_content', 
    label: 'Home Page', 
    icon: Home, 
    description: 'Main page content including statistics and descriptions',
    contentKey: 'home_content',
    statsKeys: ['home_total_value', 'home_investors', 'home_properties', 'home_cities']
  },
  { 
    key: 'footer_content', 
    label: 'Footer Content', 
    icon: FileText, 
    description: 'Company description, contact information, and footer text',
    contentKey: 'footer_content'
  },
  { 
    key: 'how_it_works_content', 
    label: 'How It Works', 
    icon: BarChart3, 
    description: 'Steps explaining how the platform works',
    contentKey: 'how_it_works_content'
  },
  { 
    key: 'risk_disclosure_content', 
    label: 'Risk Disclosure', 
    icon: AlertTriangle, 
    description: 'Investment risk warnings and compliance information',
    contentKey: 'risk_disclosure_content'
  },
  { 
    key: 'about_fractOWN_content', 
    label: 'About fractOWN', 
    icon: Info, 
    description: 'Company vision, mission, and description',
    contentKey: 'about_fractOWN_content'
  }
];

export default function EnhancedContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("home_content");
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({});
  const [content, setContent] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  // Fetch all content sections
  const { data: contentSections = [], isLoading } = useQuery<ContentSection[]>({
    queryKey: ["/api/admin/content/"],
  });

  // Update content mutation
  const updateMutation = useMutation({
    mutationFn: async ({ key, content }: { key: string; content: string }) => {
      const section = (contentSections as ContentSection[]).find((s: ContentSection) => s.key === key);
      if (!section) throw new Error("Section not found");
      
      return apiRequest(`/api/admin/content/${section.id}`, "PUT", {
        content: content.trim()
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/"] });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Content Updated",
        description: `${SECTIONS.find(s => s.key === variables.key)?.label} has been updated successfully.`,
      });
      setIsSaving(prev => ({ ...prev, [variables.key]: false }));
    },
    onError: (error: any, variables) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update content",
        variant: "destructive",
      });
      setIsSaving(prev => ({ ...prev, [variables.key]: false }));
    },
  });

  const handleSave = (key: string) => {
    setIsSaving(prev => ({ ...prev, [key]: true }));
    const currentContent = content[key] || getContentValue(key);
    updateMutation.mutate({ key, content: currentContent });
  };

  const getContentValue = (key: string) => {
    const section = contentSections.find((s: ContentSection) => s.key === key);
    return section?.content || "";
  };

  const handleContentChange = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const togglePreview = (key: string) => {
    setPreviewMode(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Preview Components
  const renderHomePreview = () => {
    const homeContent = content['home_content'] !== undefined ? content['home_content'] : getContentValue('home_content');
    const stats = [
      { value: "₹500 Cr+", label: "Assets Under Management" },
      { value: "15,000+", label: "Happy Investors" },
      { value: "50+", label: "Properties Listed" },
      { value: "8 Cities", label: "Across India" }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            fract<span className="bg-blue-900 px-1 rounded text-orange-500">OWN</span> - Real Estate Investment
          </h2>
          <div className="text-gray-600 space-y-2">
            {homeContent ? homeContent.split('\n').filter(line => line.trim()).map((line, index) => (
              <p key={index}>{line}</p>
            )) : <p>Enter home page content...</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-fractown-primary">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFooterPreview = () => {
    const footerContent = content['footer_content'] !== undefined ? content['footer_content'] : getContentValue('footer_content');
    
    return (
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">fractOWN</h3>
            <div className="text-gray-300 text-sm space-y-2">
              {footerContent.split('\n').filter(line => line.trim()).map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Properties</li>
              <li>How It Works</li>
              <li>About Us</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact Info</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: support@fractown.in</li>
              <li>Phone: +91 98765 43210</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderHowItWorksPreview = () => {
    const howItWorksContent = content['how_it_works_content'] !== undefined ? content['how_it_works_content'] : getContentValue('how_it_works_content');
    const lines = howItWorksContent.split('\n').filter(line => line.trim());
    
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lines.map((line, index) => {
            const [title, description] = line.split(':').map(s => s.trim());
            return (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-fractown-primary text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-600 text-sm">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRiskDisclosurePreview = () => {
    const riskContent = content['risk_disclosure_content'] !== undefined ? content['risk_disclosure_content'] : getContentValue('risk_disclosure_content');
    const lines = riskContent.split('\n').filter(line => line.trim());
    const sections: { title: string; items: string[] }[] = [];
    let currentSection: { title: string; items: string[] } | null = null;
    
    for (const line of lines) {
      if (line.startsWith('•')) {
        if (currentSection) {
          currentSection.items.push(line.substring(1).trim());
        }
      } else if (line.trim() && !line.startsWith('•')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { title: line.trim(), items: [] };
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Investment Risk Disclosure</h3>
        </div>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold text-gray-800 mb-2">{section.title}</h4>
              {section.items.length > 0 && (
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-600 text-sm">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAboutPreview = () => {
    const aboutContent = content['about_fractOWN_content'] !== undefined ? content['about_fractOWN_content'] : getContentValue('about_fractOWN_content');
    
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">About fractOWN</h2>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-gray-600 space-y-4">
            {aboutContent.split('\n').filter(line => line.trim()).map((line, index) => (
              <p key={index} className="text-lg leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = (sectionKey: string) => {
    switch (sectionKey) {
      case 'home_content':
        return renderHomePreview();
      case 'footer_content':
        return renderFooterPreview();
      case 'how_it_works_content':
        return renderHowItWorksPreview();
      case 'risk_disclosure_content':
        return renderRiskDisclosurePreview();
      case 'about_fractOWN_content':
        return renderAboutPreview();
      default:
        return <div>Preview not available</div>;
    }
  };

  const getFormatInstructions = (sectionKey: string) => {
    switch (sectionKey) {
      case 'home_content':
        return "Enter main description text. Each line will be a separate paragraph. Statistics are managed separately.";
      case 'footer_content':
        return "Enter company description. Each line will be a separate paragraph in the footer.";
      case 'how_it_works_content':
        return "Format: 'Step Title: Step Description' - Each line represents one step. Use this exact format with colon separator.";
      case 'risk_disclosure_content':
        return "Section titles on separate lines, bullet points start with '•'. Example:\n\nInvestment Risks\n• Point one\n• Point two\n\nCompliance\n• Point three";
      case 'about_fractOWN_content':
        return "Enter company vision and mission. Each line will be a separate paragraph.";
      default:
        return "Enter your content here.";
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading content management...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Enhanced Content Management</h2>
          <p className="text-gray-600">Edit content and see exactly how it appears on your website</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {SECTIONS.map((section) => (
            <TabsTrigger key={section.key} value={section.key} className="flex items-center space-x-2">
              <section.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{section.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map((section) => (
          <TabsContent key={section.key} value={section.key}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor Panel */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <section.icon className="w-5 h-5" />
                        <span>Edit {section.label}</span>
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePreview(section.key)}
                    >
                      {previewMode[section.key] ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {previewMode[section.key] ? "Edit" : "Preview"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={section.key} className="text-sm font-medium text-gray-700">
                      Content
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">
                      {getFormatInstructions(section.key)}
                    </p>
                    <Textarea
                      id={section.key}
                      placeholder={`Enter ${section.label.toLowerCase()} content...`}
                      value={content[section.key] !== undefined ? content[section.key] : getContentValue(section.key)}
                      onChange={(e) => handleContentChange(section.key, e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                      disabled={previewMode[section.key]}
                    />
                  </div>
                  
                  <Button
                    onClick={() => handleSave(section.key)}
                    disabled={isSaving[section.key] || previewMode[section.key]}
                    className="w-full"
                  >
                    {isSaving[section.key] ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save {section.label}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    This is exactly how the content will appear on your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-white min-h-[300px]">
                    {renderPreview(section.key)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}