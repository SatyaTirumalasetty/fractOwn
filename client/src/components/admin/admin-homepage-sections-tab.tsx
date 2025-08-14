import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Settings, 
  Eye, 
  EyeOff, 
  GripVertical, 
  Home, 
  Building, 
  Info, 
  Users, 
  MessageSquare, 
  Shield,
  Phone,
  Save,
  RotateCcw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { HomePageSection } from "@shared/schema";

// Section icon mapping
const getSectionIcon = (sectionKey: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    hero: Home,
    properties: Building,
    how_it_works: Info,
    testimonials: Users,
    about: MessageSquare,
    risk_disclosure: Shield,
    contact: Phone,
  };
  return iconMap[sectionKey] || Settings;
};

// Sortable section item component
function SortableSectionItem({ 
  section, 
  onToggle, 
  disabled 
}: { 
  section: HomePageSection; 
  onToggle: (id: string, enabled: boolean) => void;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = getSectionIcon(section.sectionKey);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-grab hover:cursor-grabbing p-1"
            data-testid={`button-drag-section-${section.sectionKey}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${section.isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <IconComponent className={`h-5 w-5 ${section.isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900" data-testid={`text-section-name-${section.sectionKey}`}>
                {section.sectionName}
              </h3>
              <p className="text-sm text-gray-500" data-testid={`text-section-description-${section.sectionKey}`}>
                {section.description}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Order: {section.displayOrder}
                </Badge>
                <Badge variant={section.isEnabled ? "default" : "secondary"} className="text-xs">
                  {section.isEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={section.isEnabled}
            onCheckedChange={(checked) => onToggle(section.id, checked)}
            disabled={disabled}
            data-testid={`switch-section-enabled-${section.sectionKey}`}
          />
          {section.isEnabled ? (
            <Eye className="h-4 w-4 text-green-600" data-testid={`icon-section-visible-${section.sectionKey}`} />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" data-testid={`icon-section-hidden-${section.sectionKey}`} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminHomepageSectionsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [localSections, setLocalSections] = useState<HomePageSection[]>([]);

  // Fetch homepage sections
  const { data: sections, isLoading, error } = useQuery<HomePageSection[]>({
    queryKey: ['/api/admin/homepage-sections'],
    queryFn: async () => {
      const response = await fetch('/api/admin/homepage-sections');
      if (!response.ok) throw new Error('Failed to fetch homepage sections');
      return response.json();
    },
  });

  // Initialize local sections when data loads
  useEffect(() => {
    if (sections) {
      setLocalSections([...sections]);
      setHasChanges(false);
    }
  }, [sections]);

  // Bulk update mutation
  const updateSectionsMutation = useMutation({
    mutationFn: async (updatedSections: HomePageSection[]) => {
      const sectionsToUpdate = updatedSections.map(section => ({
        id: section.id,
        isEnabled: section.isEnabled,
        displayOrder: section.displayOrder,
      }));
      
      return apiRequest('/api/admin/homepage-sections', 'PUT', { sections: sectionsToUpdate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/homepage-sections'] });
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Homepage sections updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update homepage sections",
        variant: "destructive",
      });
    },
  });

  const handleToggleSection = (id: string, enabled: boolean) => {
    const updatedSections = localSections.map(section =>
      section.id === id ? { ...section, isEnabled: enabled } : section
    );
    setLocalSections(updatedSections);
    setHasChanges(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = localSections.findIndex(section => section.id === active.id);
    const newIndex = localSections.findIndex(section => section.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedSections = [...localSections];
    const [movedSection] = reorderedSections.splice(oldIndex, 1);
    reorderedSections.splice(newIndex, 0, movedSection);

    // Update display order
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      displayOrder: index + 1,
    }));

    setLocalSections(updatedSections);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    updateSectionsMutation.mutate(localSections);
  };

  const handleResetChanges = () => {
    if (sections) {
      setLocalSections([...sections]);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Error loading homepage sections: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Homepage Sections</h3>
          <p className="text-sm text-gray-500">
            Control which sections appear on your homepage and their display order
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChanges}
              data-testid="button-reset-homepage-sections"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={updateSectionsMutation.isPending}
              data-testid="button-save-homepage-sections"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSectionsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Section Configuration</span>
          </CardTitle>
          <CardDescription>
            Drag and drop to reorder sections. Toggle switches to enable/disable sections.
            Changes are only saved when you click "Save Changes".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext 
              items={localSections.map(s => s.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3" data-testid="homepage-sections-list">
                {localSections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    onToggle={handleToggleSection}
                    disabled={updateSectionsMutation.isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">
                You have unsaved changes. Click "Save Changes" to apply them to your homepage.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}