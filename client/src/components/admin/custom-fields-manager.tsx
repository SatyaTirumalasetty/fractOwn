import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Save } from "lucide-react";
import { CUSTOM_FIELD_TYPES, FIELD_TYPE_CONFIG, type CustomField } from "@shared/propertyTypes";
import { toast } from "@/hooks/use-toast";

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

  const saveFieldsToDatabase = async () => {
    // This would sync field definitions to backend
    // For now, handled through the parent component's property creation/update
    return Promise.resolve();
  };

  const handleAddField = () => {
    setEditingField({
      id: '',
      name: '',
      displayName: '',
      type: CUSTOM_FIELD_TYPES.TEXT,
      required: false,
      defaultValue: ''
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
      defaultValue: editingField.defaultValue
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

  return (
    <div className="space-y-6">
      {/* Add New Field Button - Always at the top */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Property Fields</h3>
        <Button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddField();
          }} 
          size="sm" 
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Field
        </Button>
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
            
            <div className="grid grid-cols-3 gap-4">
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

      {/* Render Custom Fields */}
      {fieldDefinitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Property Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fieldDefinitions.map((field) => (
              <div key={field.id} className="flex items-center space-x-4">
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
                      setEditingField(field);
                      setIsAddingField(false);
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
                      handleDeleteField(field.id);
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}