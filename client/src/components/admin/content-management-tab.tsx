import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X, FileText, Home, AlertTriangle, ArrowUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ContentFormData {
  key: string;
  title: string;
  content: string;
  contentType: string;
  section: string;
  isActive: boolean;
  displayOrder: number;
  metadata: Record<string, any>;
}

const SECTION_TYPES = [
  { value: "footer", label: "Footer Content", icon: FileText },
  { value: "how_it_works", label: "How It Works", icon: Home },
  { value: "risk_disclosure", label: "Risk Disclosure", icon: AlertTriangle },
  { value: "about_fractOWN", label: "About fractOWN", icon: FileText }
];

const CONTENT_TYPES = [
  { value: "text", label: "Plain Text" },
  { value: "html", label: "HTML" },
  { value: "markdown", label: "Markdown" }
];

export default function ContentManagementTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentSection | null>(null);
  const [selectedSection, setSelectedSection] = useState("all");
  const [formData, setFormData] = useState<ContentFormData>({
    key: "",
    title: "",
    content: "",
    contentType: "text",
    section: "footer",
    isActive: true,
    displayOrder: 0,
    metadata: {}
  });

  // Fetch content sections
  const { data: contentSections = [], isLoading } = useQuery<ContentSection[]>({
    queryKey: ["/api/admin/content", selectedSection !== "all" ? selectedSection : undefined],
  });

  // Create content mutation
  const createMutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      return apiRequest("/api/admin/content", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Content Created",
        description: "New content section has been created successfully.",
      });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create content section",
        variant: "destructive",
      });
    },
  });

  // Update content mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContentFormData> }) => {
      return apiRequest(`/api/admin/content/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Content Updated",
        description: "Content section has been updated successfully.",
      });
      setIsEditOpen(false);
      setEditingContent(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update content section",
        variant: "destructive",
      });
    },
  });

  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/content/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Content Deleted",
        description: "Content section has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete content section",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      key: "",
      title: "",
      content: "",
      contentType: "text",
      section: "footer",
      isActive: true,
      displayOrder: 0,
      metadata: {}
    });
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = (content: ContentSection) => {
    setEditingContent(content);
    setFormData({
      key: content.key,
      title: content.title,
      content: content.content,
      contentType: content.contentType,
      section: content.section,
      isActive: content.isActive,
      displayOrder: content.displayOrder,
      metadata: content.metadata || {}
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingContent) return;
    updateMutation.mutate({
      id: editingContent.id,
      data: formData
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this content section?")) {
      deleteMutation.mutate(id);
    }
  };

  const generateKey = (title: string, section: string) => {
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${section}_${cleanTitle}`;
  };

  const getSectionIcon = (section: string) => {
    const sectionType = SECTION_TYPES.find(t => t.value === section);
    const Icon = sectionType?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const groupedSections = (contentSections as ContentSection[]).reduce((groups: Record<string, ContentSection[]>, section: ContentSection) => {
    if (!groups[section.section]) {
      groups[section.section] = [];
    }
    groups[section.section].push(section);
    return groups;
  }, {} as Record<string, ContentSection[]>);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Content Management</h3>
          <p className="text-sm text-gray-600">
            Manage footer content, risk disclosure, and "How It Works" sections
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Content Section</DialogTitle>
              <DialogDescription>
                Add a new content section to manage dynamic website content
              </DialogDescription>
            </DialogHeader>
            <ContentForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={createMutation.isPending}
              generateKey={generateKey}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Section Filter */}
      <div className="flex space-x-2">
        <Button 
          variant={selectedSection === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedSection("all")}
        >
          All Sections
        </Button>
        {SECTION_TYPES.map((type) => (
          <Button
            key={type.value}
            variant={selectedSection === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSection(type.value)}
            className="flex items-center space-x-2"
          >
            <type.icon className="h-4 w-4" />
            <span>{type.label}</span>
          </Button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {selectedSection === "all" ? (
          // Show all sections grouped
          <div className="space-y-6">
          {Object.keys(groupedSections).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Sections</h3>
                <p className="text-gray-600 mb-4">
                  Create your first content section to start managing dynamic website content.
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedSections).map(([sectionType, sections]) => (
              <div key={sectionType} className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getSectionIcon(sectionType)}
                  <h4 className="text-md font-medium capitalize">
                    {SECTION_TYPES.find(t => t.value === sectionType)?.label || sectionType}
                  </h4>
                  <Badge variant="secondary">{(sections as ContentSection[]).length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(sections as ContentSection[]).map((section: ContentSection) => (
                    <ContentSectionCard
                      key={section.id}
                      section={section}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      getSectionIcon={getSectionIcon}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
          </div>
        ) : (
          // Show specific section content
          <div className="space-y-4">
            {(contentSections as ContentSection[]).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {SECTION_TYPES.find(t => t.value === selectedSection)?.label} Content
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create content sections for this category to start managing dynamic website content.
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content Section
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(contentSections as ContentSection[]).map((section: ContentSection) => (
                  <ContentSectionCard
                    key={section.id}
                    section={section}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    getSectionIcon={getSectionIcon}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content Section</DialogTitle>
            <DialogDescription>
              Update the content section details
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditOpen(false);
              setEditingContent(null);
            }}
            isLoading={updateMutation.isPending}
            generateKey={generateKey}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Content Section Card Component
interface ContentSectionCardProps {
  section: ContentSection;
  onEdit: (section: ContentSection) => void;
  onDelete: (id: string) => void;
  getSectionIcon: (section: string) => JSX.Element;
}

function ContentSectionCard({ section, onEdit, onDelete, getSectionIcon }: ContentSectionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getSectionIcon(section.section)}
            <div>
              <h5 className="font-medium text-sm">{section.title}</h5>
              <p className="text-xs text-gray-500">{section.key}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant={section.isActive ? "default" : "secondary"} className="text-xs">
              {section.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-sm text-gray-600 line-clamp-3">
            {section.content.length > 100 
              ? `${section.content.substring(0, 100)}...` 
              : section.content
            }
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="capitalize">{section.contentType}</span>
            <span>Order: {section.displayOrder}</span>
          </div>
          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(section)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(section.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Content Form Component
interface ContentFormProps {
  formData: ContentFormData;
  setFormData: (data: ContentFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  generateKey: (title: string, section: string) => string;
  isEdit?: boolean;
}

function ContentForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isLoading, 
  generateKey,
  isEdit = false 
}: ContentFormProps) {
  // Auto-generate key when title or section changes
  useEffect(() => {
    if (!isEdit && formData.title && formData.section) {
      setFormData({
        ...formData,
        key: generateKey(formData.title, formData.section)
      });
    }
  }, [formData.title, formData.section, isEdit]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="section">Section Type</Label>
          <Select
            value={formData.section}
            onValueChange={(value) => setFormData({ ...formData, section: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center space-x-2">
                    <type.icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentType">Content Type</Label>
          <Select
            value={formData.contentType}
            onValueChange={(value) => setFormData({ ...formData, contentType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter content title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="key">Unique Key</Label>
        <Input
          id="key"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          placeholder="Unique identifier for this content"
          disabled={!isEdit}
        />
        {!isEdit && (
          <p className="text-xs text-gray-500">
            Key will be auto-generated based on title and section
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter the content..."
          rows={6}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}