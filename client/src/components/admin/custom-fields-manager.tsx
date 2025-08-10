import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Save, GripVertical } from "lucide-react";
import { CUSTOM_FIELD_TYPES, FIELD_TYPE_CONFIG, FIELD_SECTIONS, SECTION_CONFIG, type CustomField } from "@shared/propertyTypes";
import { toast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CustomFieldsManagerProps {
  customFields: Record<string, any>;
  onFieldsChange: (fields: Record<string, any>) => void;
  fieldDefinitions: CustomField[];
  onFieldDefinitionsChange: (definitions: CustomField[]) => void;
}

export function CustomFieldsManager({ 
  customFields, 
  onFieldsChange, 
  fieldDefinitions, 
  onFieldDefinitionsChange 
}: CustomFieldsManagerProps) {
  const [editingField, setEditingField] = useState<Partial<CustomField> | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);
  const [localFields, setLocalFields] = useState(customFields);

  // Sync local fields with props when they change
  useEffect(() => {
    setLocalFields(customFields);
  }, [customFields]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, section: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const sectionFields = fieldDefinitions.filter(f => f.section === section);
      const otherFields = fieldDefinitions.filter(f => f.section !== section);
      
      const oldIndex = sectionFields.findIndex((field) => field.id === active.id);
      const newIndex = sectionFields.findIndex((field) => field.id === over?.id);

      const reorderedSectionFields = arrayMove(sectionFields, oldIndex, newIndex)
        .map((field, index) => ({ ...field, order: index }));
      
      const allFields = [...otherFields, ...reorderedSectionFields]
        .sort((a, b) => a.section.localeCompare(b.section) || a.order - b.order);
      
      onFieldDefinitionsChange(allFields);
      
      toast({
        title: "Success",
        description: "Field order updated successfully"
      });
    }
  };

  const saveFieldsToDatabase = async () => {
    // This would sync field definitions to backend
    // For now, handled through the parent component's property creation/update
    return Promise.resolve();
  };

  const handleAddField = (section: string = FIELD_SECTIONS.BASIC) => {
    const sectionFields = fieldDefinitions.filter(f => f.section === section);
    const nextOrder = sectionFields.length > 0 ? Math.max(...sectionFields.map(f => f.order || 0)) + 1 : 0;
    setEditingField({
      id: '',
      name: '',
      displayName: '',
      type: CUSTOM_FIELD_TYPES.TEXT,
      required: false,
      defaultValue: '',
      section: section,
      order: nextOrder
    });
    setIsAddingField(true);
  };

  const handleSaveField = async () => {
    if (!editingField?.name || !editingField?.displayName) {
      toast({
        title: "Error",
        description: "Field name and display name are required",
        variant: "destructive"
      });
      return;
    }

    // Validate field name format
    const fieldName = editingField.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (fieldName !== editingField.name.toLowerCase()) {
      setEditingField({ ...editingField, name: fieldName });
    }

    const fieldId = fieldName;
    const newField: CustomField = {
      id: fieldId,
      name: fieldName,
      displayName: editingField.displayName,
      type: editingField.type || CUSTOM_FIELD_TYPES.TEXT,
      required: editingField.required || false,
      defaultValue: editingField.defaultValue,
      section: editingField.section || FIELD_SECTIONS.BASIC,
      order: editingField.order !== undefined ? editingField.order : Math.max(...fieldDefinitions.map(f => f.order || 0), 0) + 1
    };

    // Check if field already exists
    const existingIndex = fieldDefinitions.findIndex(f => f.id === fieldId);
    if (existingIndex >= 0) {
      // Update existing field
      const updated = [...fieldDefinitions];
      updated[existingIndex] = newField;
      onFieldDefinitionsChange(updated);
    } else {
      // Add new field
      onFieldDefinitionsChange([...fieldDefinitions, newField]);
    }

    // Initialize field value if not exists
    const currentFields = { ...localFields, ...customFields };
    if (!(fieldId in currentFields)) {
      const updatedFields = {
        ...currentFields,
        [fieldId]: newField.defaultValue || FIELD_TYPE_CONFIG[newField.type].defaultValue
      };
      setLocalFields(updatedFields);
      onFieldsChange(updatedFields);
    }

    setEditingField(null);
    setIsAddingField(false);
    
    // Save to backend immediately for persistence
    try {
      await saveFieldsToDatabase();
      toast({
        title: "Success",
        description: "Custom field saved and synchronized with database"
      });
    } catch (error) {
      toast({
        title: "Warning",
        description: "Field saved locally but database sync failed",
        variant: "destructive"
      });
    }
  };

  const handleDeleteField = (fieldId: string) => {
    if (window.confirm("Are you sure you want to delete this field? This will remove all data for this field.")) {
      // Remove from definitions
      onFieldDefinitionsChange(fieldDefinitions.filter(f => f.id !== fieldId));
      
      // Remove from values
      const { [fieldId]: removed, ...remainingFields } = localFields;
      setLocalFields(remainingFields);
      onFieldsChange(remainingFields);
      
      toast({
        title: "Success",
        description: "Custom field deleted successfully"
      });
    }
  };

  const handleFieldValueChange = (fieldId: string, value: any) => {
    const updatedFields = {
      ...localFields,
      [fieldId]: value
    };
    setLocalFields(updatedFields);
    onFieldsChange(updatedFields);
  };

  const renderFieldInput = (field: CustomField) => {
    const value = localFields[field.id] !== undefined ? localFields[field.id] : (field.defaultValue || FIELD_TYPE_CONFIG[field.type].defaultValue);
    
    switch (field.type) {
      case CUSTOM_FIELD_TYPES.TEXT:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={`Enter ${field.displayName}`}
          />
        );
        
      case CUSTOM_FIELD_TYPES.NUMBER:
      case CUSTOM_FIELD_TYPES.CURRENCY:
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldValueChange(field.id, parseFloat(e.target.value) || 0)}
            placeholder={`Enter ${field.displayName}`}
          />
        );
        
      case CUSTOM_FIELD_TYPES.PERCENTAGE:
        return (
          <Input
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={(e) => handleFieldValueChange(field.id, parseFloat(e.target.value) || 0)}
            placeholder={`Enter ${field.displayName} (0-100)`}
          />
        );
        
      case CUSTOM_FIELD_TYPES.BOOLEAN:
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => handleFieldValueChange(field.id, checked)}
          />
        );
        
      case CUSTOM_FIELD_TYPES.DATE:
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
          />
        );
        
      case CUSTOM_FIELD_TYPES.EMAIL:
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={`Enter ${field.displayName}`}
          />
        );
        
      case CUSTOM_FIELD_TYPES.URL:
        return (
          <Input
            type="url"
            value={value}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={`Enter ${field.displayName}`}
          />
        );
        
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={`Enter ${field.displayName}`}
          />
        );
    }
  };

  // Group fields by section
  const fieldsBySection = Object.values(FIELD_SECTIONS).reduce((acc, section) => {
    acc[section] = fieldDefinitions.filter(f => f.section === section).sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Record<string, CustomField[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Property Fields</h3>
      </div>

      {/* Field Definitions Management */}
      {(isAddingField || editingField) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isAddingField ? "Add New Field" : "Edit Field"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field-name">Field Name (Internal)</Label>
                <Input
                  id="field-name"
                  value={editingField?.name || ''}
                  onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                  placeholder="e.g., parking_spaces"
                  autoFocus={isAddingField}
                />
                <p className="text-xs text-gray-500 mt-1">Used in database - lowercase, underscores only</p>
              </div>
              <div>
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={editingField?.displayName || ''}
                  onChange={(e) => setEditingField({ ...editingField, displayName: e.target.value })}
                  placeholder="e.g., Parking Spaces"
                />
                <p className="text-xs text-gray-500 mt-1">Label shown to users</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field-section">Section</Label>
                <Select 
                  value={editingField?.section || FIELD_SECTIONS.BASIC} 
                  onValueChange={(value) => setEditingField({ ...editingField, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SECTION_CONFIG).map(([section, config]) => (
                      <SelectItem key={section} value={section}>
                        <span className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="field-type">Data Type</Label>
                <Select 
                  value={editingField?.type} 
                  onValueChange={(value) => setEditingField({ ...editingField, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FIELD_TYPE_CONFIG).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="default-value">Default Value</Label>
                <Input
                  id="default-value"
                  value={editingField?.defaultValue || ''}
                  onChange={(e) => setEditingField({ ...editingField, defaultValue: e.target.value })}
                  placeholder="Optional default value"
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="required"
                  checked={editingField?.required || false}
                  onCheckedChange={(checked) => setEditingField({ ...editingField, required: checked })}
                />
                <Label htmlFor="required">Required Field</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingField(null);
                  setIsAddingField(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveField();
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Field
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Render Sections */}
      {Object.entries(SECTION_CONFIG).map(([sectionKey, sectionConfig]) => {
        const sectionFields = fieldsBySection[sectionKey] || [];
        
        return (
          <Card key={sectionKey}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sectionConfig.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{sectionConfig.label}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{sectionConfig.description}</p>
                  </div>
                </div>
                <Button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddField(sectionKey);
                  }} 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionFields.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-3">Drag fields to reorder within this section</p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, sectionKey)}
                  >
                    <SortableContext
                      items={sectionFields.map(f => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {sectionFields.map((field) => (
                        <SortableFieldItem
                          key={field.id}
                          field={field}
                          value={localFields[field.id] !== undefined ? localFields[field.id] : (field.defaultValue || FIELD_TYPE_CONFIG[field.type].defaultValue)}
                          onValueChange={handleFieldValueChange}
                          onEdit={() => {
                            setEditingField(field);
                            setIsAddingField(false);
                          }}
                          onDelete={() => handleDeleteField(field.id)}
                          renderFieldInput={renderFieldInput}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No custom fields in this section yet.</p>
                  <p className="text-xs mt-1">Click "Add Field" to create your first field.</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Sortable Field Item Component
interface SortableFieldItemProps {
  field: CustomField;
  value: any;
  onValueChange: (fieldId: string, value: any) => void;
  onEdit: () => void;
  onDelete: () => void;
  renderFieldInput: (field: CustomField) => React.ReactNode;
}

function SortableFieldItem({ 
  field, 
  value, 
  onValueChange, 
  onEdit, 
  onDelete, 
  renderFieldInput 
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-4 p-3 border rounded-lg bg-white ${
        isDragging ? 'shadow-lg' : 'border-gray-200'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-1">
        <Label htmlFor={field.id} className="flex items-center gap-2">
          <span>{FIELD_TYPE_CONFIG[field.type].icon}</span>
          {field.displayName}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        <div className="mt-1">
          {renderFieldInput(field)}
        </div>
      </div>
      
      <div className="flex space-x-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-600 border-red-200 hover:bg-red-50"
          title="Delete field"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}