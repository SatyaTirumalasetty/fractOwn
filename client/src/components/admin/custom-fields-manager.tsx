import { useState } from "react";
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

  const handleSaveField = () => {
    if (!editingField?.name || !editingField?.displayName) {
      toast({
        title: "Error",
        description: "Field name and display name are required",
        variant: "destructive"
      });
      return;
    }

    const fieldId = editingField.name.toLowerCase().replace(/\s+/g, '_');
    const newField: CustomField = {
      id: fieldId,
      name: editingField.name,
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
    if (!(fieldId in customFields)) {
      onFieldsChange({
        ...customFields,
        [fieldId]: newField.defaultValue || FIELD_TYPE_CONFIG[newField.type].defaultValue
      });
    }

    setEditingField(null);
    setIsAddingField(false);
    
    toast({
      title: "Success",
      description: "Custom field saved successfully"
    });
  };

  const handleDeleteField = (fieldId: string) => {
    if (window.confirm("Are you sure you want to delete this field? This will remove all data for this field.")) {
      // Remove from definitions
      onFieldDefinitionsChange(fieldDefinitions.filter(f => f.id !== fieldId));
      
      // Remove from values
      const { [fieldId]: removed, ...remainingFields } = customFields;
      onFieldsChange(remainingFields);
      
      toast({
        title: "Success",
        description: "Custom field deleted successfully"
      });
    }
  };

  const handleFieldValueChange = (fieldId: string, value: any) => {
    onFieldsChange({
      ...customFields,
      [fieldId]: value
    });
  };

  const renderFieldInput = (field: CustomField) => {
    const value = customFields[field.id] || field.defaultValue || FIELD_TYPE_CONFIG[field.type].defaultValue;
    
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Property Fields</h3>
        <Button onClick={handleAddField} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Property Field
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
                <Label htmlFor="field-name">Field Name</Label>
                <Input
                  id="field-name"
                  value={editingField?.name || ''}
                  onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                  placeholder="e.g., parking_spaces"
                />
              </div>
              <div>
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={editingField?.displayName || ''}
                  onChange={(e) => setEditingField({ ...editingField, displayName: e.target.value })}
                  placeholder="e.g., Parking Spaces"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                onClick={() => {
                  setEditingField(null);
                  setIsAddingField(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveField}>
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
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingField(field);
                      setIsAddingField(false);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteField(field.id)}
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