import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Upload, Link, X, FileText, Image, FileIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropertySchema, updatePropertySchema, type Property, type InsertProperty, type UpdateProperty } from "@shared/schema";
import { getStates, getCitiesByState } from "@/data/indian-states-cities";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const propertyFormSchema = insertPropertySchema.extend({
  totalValue: z.coerce.number().min(1, "Total value must be greater than 0"),
  minInvestment: z.coerce.number().min(1, "Minimum investment must be greater than 0"),
  fundingProgress: z.coerce.number().min(0).max(100).default(0),
  imageUrls: z.string().transform((val) => val.split('\n').filter(url => url.trim().length > 0)),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.enum(["image", "document", "pdf"]),
    size: z.number().optional(),
  })).default([]),
});

type PropertyForm = z.infer<typeof propertyFormSchema>;

export function AdminPropertiesTab() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [attachments, setAttachments] = useState<Array<{name: string, url: string, type: "image" | "document" | "pdf"}>>([]);
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/admin/properties"],
  });

  const createForm = useForm<PropertyForm>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      city: "",
      state: "",
      totalValue: 0,
      minInvestment: 0,
      expectedReturn: "",
      fundingProgress: 0,
      imageUrls: "",
      propertyType: "residential",
      isActive: true,
      attachments: [],
    },
  });

  const editForm = useForm<PropertyForm>({
    resolver: zodResolver(propertyFormSchema),
  });

  // File handling functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const fileType = file.type.startsWith('image/') ? 'image' : 
                        file.type === 'application/pdf' ? 'pdf' : 'document';
        
        // Create a URL for the file (in a real app, you'd upload to a server)
        const url = URL.createObjectURL(file);
        
        setAttachments(prev => [...prev, {
          name: file.name,
          url: url,
          type: fileType
        }]);
      });
    }
  };

  const handleGoogleDriveLink = () => {
    if (googleDriveLink.trim()) {
      // Extract file name from Google Drive link
      const fileName = googleDriveLink.split('/').pop()?.split('?')[0] || 'Google Drive File';
      const fileType = googleDriveLink.includes('document') ? 'document' : 
                      googleDriveLink.includes('pdf') ? 'pdf' : 'image';
      
      setAttachments(prev => [...prev, {
        name: fileName,
        url: googleDriveLink,
        type: fileType
      }]);
      setGoogleDriveLink("");
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle state change to update available cities
  const handleStateChange = (state: string, form: any) => {
    setSelectedState(state);
    const cities = getCitiesByState(state);
    setAvailableCities(cities);
    form.setValue("state", state);
    form.setValue("city", ""); // Reset city when state changes
  };

  // Initialize cities when editing existing property
  useEffect(() => {
    if (editingProperty && editingProperty.state) {
      setSelectedState(editingProperty.state);
      const cities = getCitiesByState(editingProperty.state);
      setAvailableCities(cities);
    }
  }, [editingProperty]);

  // Toggle property active status
  const togglePropertyStatus = async (property: Property) => {
    try {
      const response = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !property.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle property status");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      
      toast({
        title: "Status Updated",
        description: `Property ${property.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update property status.",
        variant: "destructive",
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: PropertyForm) => {
      const propertyData = {
        ...data,
        attachments: attachments
      };
      
      return await apiRequest("/api/admin/properties", {
        method: "POST",
        body: JSON.stringify(propertyData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Created",
        description: "The property has been successfully created.",
      });
      setIsCreateOpen(false);
      createForm.reset();
      setAttachments([]);
      setGoogleDriveLink("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PropertyForm> }) => {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update property");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Updated",
        description: "The property has been successfully updated.",
      });
      setIsEditOpen(false);
      setEditingProperty(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/properties/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Deleted",
        description: "The property has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    editForm.reset({
      name: property.name,
      description: property.description,
      location: property.location,
      city: property.city,
      state: property.state,
      totalValue: property.totalValue,
      minInvestment: property.minInvestment,
      expectedReturn: property.expectedReturn,
      fundingProgress: property.fundingProgress,
      imageUrls: property.imageUrls.join('\n'),
      propertyType: property.propertyType as "residential" | "commercial",
      isActive: property.isActive,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const PropertyForm = ({ form, onSubmit, submitText, isSubmitting }: {
    form: any;
    onSubmit: (data: PropertyForm) => void;
    submitText: string;
    isSubmitting: boolean;
  }) => (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Property Name</Label>
          <Input {...form.register("name")} placeholder="Property name" />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Select onValueChange={(value) => form.setValue("propertyType", value)} defaultValue={form.getValues("propertyType")}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea {...form.register("description")} placeholder="Property description" />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input {...form.register("location")} placeholder="Area/Locality" />
          {form.formState.errors.location && (
            <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select value={form.watch("state")} onValueChange={(value) => handleStateChange(value, form)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {getStates().map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.state && (
            <p className="text-sm text-red-500">{form.formState.errors.state.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Select value={form.watch("city")} onValueChange={(value) => form.setValue("city", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.city && (
            <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="totalValue">Total Value (₹)</Label>
          <Input type="number" {...form.register("totalValue")} placeholder="25000000" />
          {form.formState.errors.totalValue && (
            <p className="text-sm text-red-500">{form.formState.errors.totalValue.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="minInvestment">Minimum Investment (₹)</Label>
          <Input type="number" {...form.register("minInvestment")} placeholder="25000" />
          {form.formState.errors.minInvestment && (
            <p className="text-sm text-red-500">{form.formState.errors.minInvestment.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expectedReturn">Expected Return (%)</Label>
          <Input {...form.register("expectedReturn")} placeholder="11.20" />
          {form.formState.errors.expectedReturn && (
            <p className="text-sm text-red-500">{form.formState.errors.expectedReturn.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fundingProgress">Funding Progress (%)</Label>
          <Input type="number" min="0" max="100" {...form.register("fundingProgress")} placeholder="0" />
          {form.formState.errors.fundingProgress && (
            <p className="text-sm text-red-500">{form.formState.errors.fundingProgress.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="imageUrls">Image URLs (one per line)</Label>
          <Textarea 
            {...form.register("imageUrls")} 
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            className="min-h-[80px]"
          />
          {form.formState.errors.imageUrls && (
            <p className="text-sm text-red-500">{form.formState.errors.imageUrls.message}</p>
          )}
        </div>

        <div>
          <Label>File Attachments</Label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={() => document.querySelector('input[type="file"]')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Google Drive link (https://drive.google.com/...)"
                value={googleDriveLink}
                onChange={(e) => setGoogleDriveLink(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleGoogleDriveLink}>
                <Link className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </div>

        {attachments.length > 0 && (
          <div>
            <Label>Attached Files</Label>
            <div className="space-y-2 mt-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    {file.type === "image" ? (
                      <Image className="w-4 h-4" />
                    ) : file.type === "pdf" ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <FileIcon className="w-4 h-4" />
                    )}
                    <span className="text-sm">{file.name}</span>
                    <Badge variant="outline">{file.type}</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );

  if (isLoading) {
    return <div>Loading properties...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Properties ({properties.length})</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Property</DialogTitle>
              <DialogDescription>
                Add a new property to the fractOWN platform
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <PropertyForm
                form={createForm}
                onSubmit={(data) => createMutation.mutate(data)}
                submitText="Create Property"
                isSubmitting={createMutation.isPending}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Min Investment</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property: Property) => (
              <TableRow key={property.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{property.name}</div>
                    <div className="text-sm text-gray-500">{property.description.slice(0, 50)}...</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div>{property.location}</div>
                    <div className="text-sm text-gray-500">{property.city}, {property.state}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={property.propertyType === "residential" ? "default" : "secondary"}>
                    {property.propertyType}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(property.totalValue)}</TableCell>
                <TableCell>{formatCurrency(property.minInvestment)}</TableCell>
                <TableCell>{property.fundingProgress}%</TableCell>
                <TableCell>
                  <Badge variant={property.isActive ? "default" : "secondary"}>
                    {property.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => togglePropertyStatus(property)}
                      className={property.isActive ? "text-green-600 hover:text-green-700" : "text-gray-600 hover:text-gray-700"}
                    >
                      {property.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(property)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-200"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update property information
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {editingProperty && (
              <PropertyForm
                form={editForm}
                onSubmit={(data) => updateMutation.mutate({ id: editingProperty.id, data })}
                submitText="Update Property"
                isSubmitting={updateMutation.isPending}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}