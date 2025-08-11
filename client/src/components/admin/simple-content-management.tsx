import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, FileText, Home, AlertTriangle, Info } from "lucide-react";

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
  { key: 'home_content', label: 'Home Page', icon: Home, description: 'Main page content including statistics and descriptions' },
  { key: 'footer_content', label: 'Footer Content', icon: FileText, description: 'Company description, contact information, and footer text' },
  { key: 'how_it_works_content', label: 'How It Works', icon: Home, description: 'Steps explaining how the platform works' },
  { key: 'risk_disclosure_content', label: 'Risk Disclosure', icon: AlertTriangle, description: 'Investment risk warnings and compliance information' },
  { key: 'about_fractOWN_content', label: 'About fractOWN', icon: Info, description: 'Company vision, mission, and description' }
];

export default function SimpleContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("home_content");
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
    updateMutation.mutate({ key, content: content[key] || getCurrentContent(key) });
  };

  const getCurrentContent = (key: string) => {
    const section = (contentSections as ContentSection[]).find((s: ContentSection) => s.key === key);
    return section?.content || '';
  };

  const getContentValue = (key: string) => {
    return content[key] !== undefined ? content[key] : getCurrentContent(key);
  };

  const handleContentChange = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <Card key={section.key} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Content Management</h3>
        <p className="text-sm text-gray-600">
          Update website content for different sections. Each section has one main content area to edit.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {SECTIONS.map((section) => (
            <TabsTrigger 
              key={section.key} 
              value={section.key}
              className="flex items-center space-x-1"
            >
              <section.icon className="h-3 w-3" />
              <span className="hidden sm:inline text-xs">{section.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map((section) => (
          <TabsContent key={section.key} value={section.key}>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <section.icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <CardTitle>{section.label}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`content-${section.key}`}>Content</Label>
                  <Textarea
                    id={`content-${section.key}`}
                    value={getContentValue(section.key)}
                    onChange={(e) => handleContentChange(section.key, e.target.value)}
                    rows={8}
                    className="min-h-[200px]"
                    placeholder={`Enter ${section.label.toLowerCase()} content...`}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave(section.key)}
                    disabled={isSaving[section.key] || updateMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {isSaving[section.key] ? "Saving..." : "Save Changes"}
                    </span>
                  </Button>
                </div>

                {section.key === 'footer_content' && (
                  <div className="text-xs text-gray-500 mt-2">
                    <strong>Format:</strong> Use line breaks to separate company description, contact email, phone, and address.
                  </div>
                )}
                
                {section.key === 'how_it_works_content' && (
                  <div className="text-xs text-gray-500 mt-2">
                    <strong>Format:</strong> Each step should start with the step title followed by a colon, then the description. Separate steps with blank lines.
                  </div>
                )}
                
                {section.key === 'home_content' && (
                  <div className="text-xs text-gray-500 mt-2">
                    <strong>Format:</strong> Include main heading, description, and statistics. Use "₹" for currency and "+" symbols for statistics.
                  </div>
                )}

                {section.key === 'about_fractOWN_content' && (
                  <div className="text-xs text-gray-500 mt-2">
                    <strong>Format:</strong> Include company description, vision (starting with "Vision:"), and mission (starting with "Mission:"). Separate with blank lines.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}