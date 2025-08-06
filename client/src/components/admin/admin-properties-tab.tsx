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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Basic Information
          </h3>
          <p className="text-sm text-gray-600 mt-1">Essential property details and classification</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Property Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              {...form.register("name")} 
              placeholder="Enter property name (e.g., Luxury Apartments Mumbai)"
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="propertyType" className="text-sm font-medium text-gray-700">
              Property Type <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => form.setValue("propertyType", value)} defaultValue={form.getValues("propertyType")}>
              <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500">
                <SelectValue placeholder="Choose property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">🏠 Residential</SelectItem>
                <SelectItem value="commercial">🏢 Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Property Description <span className="text-red-500">*</span>
          </Label>
          <Textarea 
            {...form.register("description")} 
            placeholder="Provide a detailed description of the property, including key features, amenities, and unique selling points..."
            className="min-h-[100px] bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors resize-none"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {form.formState.errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Location Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600">📍</span>
            Location Details
          </h3>
          <p className="text-sm text-gray-600 mt-1">Specify the exact location and geographic details</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Area/Locality <span className="text-red-500">*</span>
            </Label>
            <Input 
              {...form.register("location")} 
              placeholder="e.g., Bandra West, Koramangala"
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
            />
            {form.formState.errors.location && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.location.message}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="state" className="text-sm font-medium text-gray-700">
              State <span className="text-red-500">*</span>
            </Label>
            <Select value={form.watch("state")} onValueChange={(value) => handleStateChange(value, form)}>
              <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500">
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
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.state.message}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="city" className="text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </Label>
            <Select value={form.watch("city")} onValueChange={(value) => form.setValue("city", value)}>
              <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500">
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
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.city.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Information Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-green-600">💰</span>
            Investment Details
          </h3>
          <p className="text-sm text-gray-600 mt-1">Property valuation and investment parameters</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="totalValue" className="text-sm font-medium text-gray-700">
              Total Value <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <Input 
                {...form.register("totalValue", { valueAsNumber: true })} 
                type="number" 
                placeholder="10,00,00,000"
                className="pl-8 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
            {form.formState.errors.totalValue && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.totalValue.message}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="minInvestment" className="text-sm font-medium text-gray-700">
              Minimum Investment <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <Input 
                {...form.register("minInvestment", { valueAsNumber: true })} 
                type="number" 
                placeholder="10,00,000"
                className="pl-8 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
            {form.formState.errors.minInvestment && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.minInvestment.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="expectedReturn" className="text-sm font-medium text-gray-700">
              Expected Return (Annual)
            </Label>
            <div className="relative">
              <Input 
                {...form.register("expectedReturn")} 
                placeholder="12.5"
                className="pr-8 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="fundingProgress" className="text-sm font-medium text-gray-700">
              Funding Progress
            </Label>
            <div className="relative">
              <Input 
                {...form.register("fundingProgress", { valueAsNumber: true })} 
                type="number" 
                placeholder="0" 
                min="0" 
                max="100"
                className="pr-8 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Media & Documentation Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Image className="h-5 w-5 text-purple-600" />
            Media & Documentation
          </h3>
          <p className="text-sm text-gray-600 mt-1">Property images and supporting documents</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="imageUrls" className="text-sm font-medium text-gray-700">
              Image URLs
            </Label>
            <Textarea 
              {...form.register("imageUrls")} 
              placeholder="https://example.com/property-exterior.jpg&#10;https://example.com/property-interior.jpg&#10;https://example.com/property-amenities.jpg"
              className="min-h-[100px] bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors resize-none"
            />
            <p className="text-xs text-gray-500">Enter one image URL per line. Supported formats: JPG, PNG, WebP</p>
            {form.formState.errors.imageUrls && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.imageUrls.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              File Uploads
            </Label>
            <div className="space-y-4">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                    <Input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="h-9 px-4 text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Images, PDFs, or Documents</p>
                </div>
              </div>

              {/* Google Drive Link Section */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">
                  Or add Google Drive link
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://drive.google.com/..."
                    value={googleDriveLink}
                    onChange={(e) => setGoogleDriveLink(e.target.value)}
                    className="flex-1 h-9 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleGoogleDriveLink}
                    className="h-9 px-3"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attached Files Display */}
        {attachments.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Attached Files ({attachments.length})
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {file.type === "image" ? (
                        <Image className="w-5 h-5 text-green-600" />
                      ) : file.type === "pdf" ? (
                        <FileText className="w-5 h-5 text-red-600" />
                      ) : (
                        <FileIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {file.type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="flex-shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Property...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {submitText}
              </div>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
            className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset Form
          </Button>
        </div>
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
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
            <DialogHeader className="pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Create New Property
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    Add a new investment opportunity to the fractOWN platform
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto py-6 px-1 -mx-1">
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