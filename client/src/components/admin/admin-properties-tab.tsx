import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Upload, Link, X, FileText, Image, FileIcon, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, Search, Filter, Calendar, TrendingUp, BarChart3, RefreshCw, Download, Settings, Building, MapPin, DollarSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropertySchema, updatePropertySchema, type Property, type InsertProperty, type UpdateProperty } from "@shared/schema";
import { CustomFieldsManager } from "./custom-fields-manager";
import { FIELD_SECTIONS, SECTION_CONFIG, FIELD_TYPE_CONFIG, PRODUCTION_SAFETY_CONFIG, type CustomField } from "@shared/propertyTypes";
import { getStates, getCitiesByState } from "@/data/indian-states-cities";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";


const propertyFormSchema = insertPropertySchema.extend({
  totalValue: z.coerce.number().min(1, "Total value must be greater than 0"),
  minInvestment: z.coerce.number().min(1, "Minimum investment must be greater than 0"),
  fundingProgress: z.coerce.number().min(0).max(100).default(0),
  imageUrls: z.union([
    z.string().transform((str) => str.split('\n').map(url => url.trim()).filter(url => url.length > 0)),
    z.array(z.string())
  ]).default([]),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.enum(["image", "document", "pdf"]),
    size: z.number().optional(),
  })).default([]),
  customFields: z.record(z.any()).default({}),
});

type PropertyForm = z.infer<typeof propertyFormSchema>;

export function AdminPropertiesTab() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [attachments, setAttachments] = useState<Array<{name: string, url: string, type: "image" | "document" | "pdf"}>>([]);
  const [fileValidationMessage, setFileValidationMessage] = useState<string>("");
  const [showFileValidation, setShowFileValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [fieldDefinitions, setFieldDefinitions] = useState<CustomField[]>([]);

  // Load field definitions from environment-specific localStorage on mount
  useEffect(() => {
    const storageKey = PRODUCTION_SAFETY_CONFIG.getCustomFieldStorageKey();
    const savedDefinitions = localStorage.getItem(storageKey);
    if (savedDefinitions) {
      try {
        const definitions = JSON.parse(savedDefinitions);
        setFieldDefinitions(definitions);
        
        // Show production isolation warning if applicable
        if (PRODUCTION_SAFETY_CONFIG.shouldIsolateData()) {
          toast({
            title: "Production Data Isolation",
            description: PRODUCTION_SAFETY_CONFIG.getDataIsolationWarning(),
            variant: "default"
          });
        }
      } catch (error) {
        console.error('Failed to load custom field definitions:', error);
      }
    }
  }, []);

  // Save field definitions to environment-specific localStorage whenever they change
  useEffect(() => {
    const storageKey = PRODUCTION_SAFETY_CONFIG.getCustomFieldStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(fieldDefinitions));
  }, [fieldDefinitions]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery<Property[]>({
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
      imageUrls: [],
      propertyType: "residential",
      isActive: true,
      attachments: [],
      customFields: {},
    },
  });

  const editForm = useForm<PropertyForm>({
    resolver: zodResolver(propertyFormSchema),
  });

  // Enhanced file validation function
  const validateFiles = (files: FileList): { valid: boolean; errors: string[]; validFiles: File[] } => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 10;

    const errors: string[] = [];
    const validFiles: File[] = [];

    if (files.length > maxFiles) {
      errors.push(`Too many files selected. Maximum ${maxFiles} files allowed.`);
    }

    if (attachments.length + files.length > maxFiles) {
      errors.push(`Total files would exceed limit of ${maxFiles}. Currently have ${attachments.length} files.`);
    }

    Array.from(files).forEach((file) => {
      const allAllowedTypes = [...allowedImageTypes, ...allowedDocTypes];
      
      if (file.size > maxFileSize) {
        errors.push(`File "${file.name}" exceeds 10MB size limit.`);
        return;
      }

      if (!allAllowedTypes.includes(file.type)) {
        errors.push(`File "${file.name}" has unsupported format "${file.type}".`);
        return;
      }

      if (file.name.length > 255) {
        errors.push(`File "${file.name}" name is too long (max 255 characters).`);
        return;
      }

      // Check for suspicious extensions
      const suspiciousExts = ['.exe', '.bat', '.cmd', '.scr', '.js', '.php'];
      const hasSupiciousExt = suspiciousExts.some(ext => file.name.toLowerCase().endsWith(ext));
      if (hasSupiciousExt) {
        errors.push(`File "${file.name}" has a suspicious extension and cannot be uploaded.`);
        return;
      }

      validFiles.push(file);
    });

    return { valid: errors.length === 0, errors, validFiles };
  };

  // Cloud storage upload handlers


  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log("Direct file upload started:", files);
    
    // Validate files
    const validationErrors: string[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxFileSize = 10485760; // 10MB

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        validationErrors.push(`${file.name}: Invalid file type`);
      }
      if (file.size > maxFileSize) {
        validationErrors.push(`${file.name}: File too large (max 10MB)`);
      }
    });

    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      setShowFileValidation(true);
      return;
    }

    try {
      // Upload files sequentially
      for (const file of files) {
        console.log("Uploading file:", file.name);
        
        // Get upload URL
        const uploadResponse = await fetch('/api/objects/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to get upload URL');
        }
        
        const { uploadURL } = await uploadResponse.json();
        console.log("Got upload URL:", uploadURL);
        
        // Upload file directly to cloud storage
        const uploadFileResponse = await fetch(uploadURL, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });
        
        if (!uploadFileResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        console.log("File uploaded successfully:", file.name);
        
        // Determine file type
        const fileType = file.type.startsWith('image/') ? 'image' : 
                        file.type === 'application/pdf' ? 'pdf' : 'document';
        
        // Extract object ID from upload URL and create normalized path
        const urlParts = uploadURL.split('/');
        const objectId = urlParts[urlParts.length - 1].split('?')[0];
        const normalizedUrl = `/objects/uploads/${objectId}`;
        
        console.log("Adding attachment:", { name: file.name, url: normalizedUrl, type: fileType });
        
        // Add to attachments
        setAttachments(prev => [...prev, {
          name: file.name,
          url: normalizedUrl,
          type: fileType
        }]);
      }
      
      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) uploaded to cloud storage.`,
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    }
    
    // Reset file input
    e.target.value = '';
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
      // The imageUrls field is already transformed by Zod validation
      // Since we used z.union with transform, data.imageUrls is already an array
      const imageUrls = Array.isArray(data.imageUrls) ? data.imageUrls : [];
      
      console.log('Processing image URLs:', { 
        originalData: data.imageUrls, 
        processedUrls: imageUrls,
        attachments: attachments 
      });
      
      const propertyData = {
        ...data,
        imageUrls: imageUrls,
        attachments: attachments,
        customFields: customFields
      };
      
      const response = await fetch("/api/admin/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create property");
      }
      
      return await response.json();
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
      
      // Reset custom field values to their default values but keep field definitions
      const resetFields: Record<string, any> = {};
      fieldDefinitions.forEach(def => {
        resetFields[def.id] = def.defaultValue || FIELD_TYPE_CONFIG[def.type as keyof typeof FIELD_TYPE_CONFIG]?.defaultValue || '';
      });
      setCustomFields(resetFields);
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
      // The imageUrls field is already transformed by Zod validation
      const imageUrls = Array.isArray(data.imageUrls) ? data.imageUrls : [];
      
      console.log('Updating image URLs:', { 
        originalData: data.imageUrls, 
        processedUrls: imageUrls,
        attachments: attachments 
      });
      
      const updatedData = {
        ...data,
        imageUrls: imageUrls,
        attachments: attachments,
        customFields: customFields
      };
      
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
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
      return apiRequest(`/api/admin/properties/${id}`, "DELETE");
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
      imageUrls: Array.isArray(property.imageUrls) ? property.imageUrls : [property.imageUrls].filter(Boolean),
      propertyType: property.propertyType as "residential" | "commercial",
      isActive: property.isActive,
    });
    
    // Populate attachments from the property data
    if (property.attachments && Array.isArray(property.attachments)) {
      setAttachments(property.attachments);
    } else {
      setAttachments([]);
    }
    
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

  // Calculate property statistics
  const propertyStats = useMemo(() => {
    if (!properties.length) return { total: 0, active: 0, totalValue: 0, avgProgress: 0 };
    
    const active = properties.filter(p => p.isActive).length;
    const totalValue = properties.reduce((sum, p) => sum + (p.totalValue || 0), 0);
    const avgProgress = properties.reduce((sum, p) => sum + (p.fundingProgress || 0), 0) / properties.length;
    
    return {
      total: properties.length,
      active,
      totalValue,
      avgProgress: Math.round(avgProgress)
    };
  }, [properties]);

  // Filtering logic
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(property => property.propertyType === filterType);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(property => 
        statusFilter === "active" ? property.isActive : !property.isActive
      );
    }

    // Sort logic
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.id).getTime() - new Date(a.id).getTime();
        case 'oldest': return new Date(a.id).getTime() - new Date(b.id).getTime();
        case 'value-high': return (b.totalValue || 0) - (a.totalValue || 0);
        case 'value-low': return (a.totalValue || 0) - (b.totalValue || 0);
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return filtered;
  }, [properties, searchTerm, filterType, statusFilter, sortBy]);

  const PropertyForm = ({ form, onSubmit, submitText, isSubmitting }: {
    form: any;
    onSubmit: (data: PropertyForm) => void;
    submitText: string;
    isSubmitting: boolean;
  }) => (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information Section */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            Basic Information
          </h3>
          <p className="text-gray-600">Essential property details and classification</p>
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

        {/* Basic Information Custom Fields */}
        <SectionCustomFields 
          section={FIELD_SECTIONS.BASIC}
          fieldDefinitions={fieldDefinitions}
          customFields={customFields}
          onFieldsChange={setCustomFields}
          onFieldDefinitionsChange={setFieldDefinitions}
        />
      </div>

      {/* Location Information Section */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            Location Details
          </h3>
          <p className="text-gray-600">Specify the exact location and geographic details</p>
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

        {/* Location Custom Fields */}
        <SectionCustomFields 
          section={FIELD_SECTIONS.LOCATION}
          fieldDefinitions={fieldDefinitions}
          customFields={customFields}
          onFieldsChange={setCustomFields}
          onFieldDefinitionsChange={setFieldDefinitions}
        />
      </div>

      {/* Financial Information Section */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            Investment Details
          </h3>
          <p className="text-gray-600">Property valuation and investment parameters</p>
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

        {/* Investment Custom Fields */}
        <SectionCustomFields 
          section={FIELD_SECTIONS.INVESTMENT}
          fieldDefinitions={fieldDefinitions}
          customFields={customFields}
          onFieldsChange={setCustomFields}
          onFieldDefinitionsChange={setFieldDefinitions}
        />
      </div>

      {/* Media & Documentation Section */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Image className="h-4 w-4 text-white" />
            </div>
            Media & Documentation
          </h3>
          <p className="text-gray-600">Property images and supporting documents</p>
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
            
            {/* File Validation Alert */}
            {showFileValidation && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="space-y-2">
                    <p className="font-medium">File validation failed:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                    <div className="mt-3 text-sm">
                      <p><strong>Allowed formats:</strong> JPG, PNG, WebP, PDF, DOC, DOCX</p>
                      <p><strong>Max file size:</strong> 10MB per file</p>
                      <p><strong>Max files:</strong> 10 files per property</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFileValidation(false)}
                      className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Dismiss
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              {/* Direct Cloud Storage File Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-4">
                    <input
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                      onChange={handleDirectFileUpload}
                      className="hidden"
                      id="file-upload-input"
                    />
                    <label
                      htmlFor="file-upload-input"
                      className="inline-flex items-center justify-center h-9 px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-md cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Browse & Upload Files
                    </label>
                    <p className="text-xs text-gray-500">Direct upload to cloud storage</p>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Allowed: JPG, PNG, WebP, PDF, DOC, DOCX (Max 10MB each, 10 files total)
                  </div>
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

        {/* Property Features Custom Fields */}
        <SectionCustomFields 
          section={FIELD_SECTIONS.FEATURES}
          fieldDefinitions={fieldDefinitions}
          customFields={customFields}
          onFieldsChange={setCustomFields}
          onFieldDefinitionsChange={setFieldDefinitions}
        />
      </div>

      {/* Legal & Documentation Section */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Legal & Documentation
          </h3>
          <p className="text-sm text-gray-600 mt-1">Legal requirements and compliance documentation</p>
        </div>

        {/* Legal Custom Fields */}
        <SectionCustomFields 
          section={FIELD_SECTIONS.LEGAL}
          fieldDefinitions={fieldDefinitions}
          customFields={customFields}
          onFieldsChange={setCustomFields}
          onFieldDefinitionsChange={setFieldDefinitions}
        />
      </div>

      {/* Submit Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 -m-8 p-8 mt-8 border-t border-gray-200 rounded-b-2xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
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
            className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
          >
            Reset Form
          </Button>
        </div>
      </div>
    </form>
  );

  // Section-specific custom fields component
  const SectionCustomFields = ({ 
    section, 
    fieldDefinitions, 
    customFields, 
    onFieldsChange, 
    onFieldDefinitionsChange 
  }: {
    section: string;
    fieldDefinitions: CustomField[];
    customFields: Record<string, any>;
    onFieldsChange: (fields: Record<string, any>) => void;
    onFieldDefinitionsChange: (definitions: CustomField[]) => void;
  }) => {
    const [isAddingField, setIsAddingField] = useState(false);
    const [editingField, setEditingField] = useState<CustomField | null>(null);
    const [newField, setNewField] = useState({
      displayName: '',
      type: 'text' as const,
      required: false,
      defaultValue: ''
    });

    const sectionFields = fieldDefinitions.filter(f => f.section === section).sort((a, b) => (a.order || 0) - (b.order || 0));
    const sectionConfig = SECTION_CONFIG[section as keyof typeof SECTION_CONFIG];
    
    if (!sectionConfig) return null;

    const handleAddField = () => {
      setNewField({
        displayName: '',
        type: 'text',
        required: false,
        defaultValue: ''
      });
      setIsAddingField(true);
    };

    const handleSaveField = async () => {
      if (!newField.displayName.trim()) {
        toast({
          title: "Error",
          description: "Field name is required",
          variant: "destructive"
        });
        return;
      }

      const nextOrder = sectionFields.length > 0 ? Math.max(...sectionFields.map(f => f.order || 0)) + 1 : 0;
      const fieldName = newField.displayName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const fieldId = `${section}_${fieldName}_${Date.now()}`;
      
      const customField: CustomField = {
        id: fieldId,
        name: fieldName,
        displayName: newField.displayName,
        type: newField.type,
        required: newField.required,
        defaultValue: newField.defaultValue,
        section: section,
        order: nextOrder
      };

      // Save to state and localStorage for persistence
      onFieldDefinitionsChange([...fieldDefinitions, customField]);
      
      // Initialize field value
      const initialValue = newField.defaultValue || FIELD_TYPE_CONFIG[newField.type].defaultValue;
      onFieldsChange({
        ...customFields,
        [fieldId]: initialValue
      });

      setIsAddingField(false);
      toast({
        title: "Success",
        description: "Custom field added successfully"
      });
    };

    const handleEditField = (field: CustomField) => {
      setEditingField(field);
      setNewField({
        displayName: field.displayName,
        type: field.type,
        required: field.required,
        defaultValue: field.defaultValue
      });
      setIsAddingField(true);
    };

    const handleUpdateField = async () => {
      if (!editingField || !newField.displayName.trim()) {
        toast({
          title: "Error",
          description: "Field name is required",
          variant: "destructive"
        });
        return;
      }

      const updatedField: CustomField = {
        ...editingField,
        displayName: newField.displayName,
        type: newField.type,
        required: newField.required,
        defaultValue: newField.defaultValue
      };

      const updatedDefinitions = fieldDefinitions.map(f => 
        f.id === editingField.id ? updatedField : f
      );
      onFieldDefinitionsChange(updatedDefinitions);
      
      setIsAddingField(false);
      setEditingField(null);
      toast({
        title: "Success",
        description: "Custom field updated successfully"
      });
    };

    const handleDeleteField = (fieldId: string) => {
      if (!confirm('Are you sure you want to delete this field? This will remove all data for this field.')) return;
      
      const updatedDefinitions = fieldDefinitions.filter(f => f.id !== fieldId);
      onFieldDefinitionsChange(updatedDefinitions);
      
      const updatedFields = { ...customFields };
      delete updatedFields[fieldId];
      onFieldsChange(updatedFields);

      toast({
        title: "Success",
        description: "Custom field deleted successfully"
      });
    };

    const renderFieldInput = (field: CustomField) => {
      const value = customFields[field.id] !== undefined ? customFields[field.id] : field.defaultValue;
      
      const handleChange = (newValue: any) => {
        onFieldsChange({
          ...customFields,
          [field.id]: newValue
        });
      };

      const config = FIELD_TYPE_CONFIG[field.type as keyof typeof FIELD_TYPE_CONFIG];
      if (!config) return null;

      switch (field.type) {
        case 'text':
        case 'email':
        case 'url':
          return (
            <Input
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={`Enter ${field.displayName}`}
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
              type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
            />
          );
        case 'number':
        case 'currency':
        case 'percentage':
          return (
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
              placeholder={`Enter ${field.displayName}`}
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
            />
          );
        case 'boolean':
          return (
            <div className="flex items-center space-x-2">
              <Switch
                checked={Boolean(value)}
                onCheckedChange={handleChange}
              />
              <Label>{Boolean(value) ? 'Yes' : 'No'}</Label>
            </div>
          );
        case 'date':
          return (
            <Input
              type="date"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
            />
          );
        default:
          return (
            <Input
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={`Enter ${field.displayName}`}
              className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
            />
          );
      }
    };

    return (
      <div className="space-y-4">
        {sectionFields.length > 0 && (
          <div className="space-y-3">
            {sectionFields.map((field) => (
              <div key={field.id} className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                <div className="lg:col-span-3 space-y-3">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <span>{FIELD_TYPE_CONFIG[field.type as keyof typeof FIELD_TYPE_CONFIG]?.icon || '📝'}</span>
                    {field.displayName}
                    {field.required && <span className="text-red-500">*</span>}
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                      {FIELD_TYPE_CONFIG[field.type as keyof typeof FIELD_TYPE_CONFIG]?.label || field.type}
                    </Badge>
                  </Label>
                  {renderFieldInput(field)}
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditField(field)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteField(field.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button
          type="button"
          variant="outline"
          onClick={handleAddField}
          className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {sectionConfig.label} Field
        </Button>

        {/* Add/Edit Field Dialog */}
        <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingField ? 'Edit' : 'Add'} {sectionConfig.label} Field
              </DialogTitle>
              <DialogDescription>
                Configure the custom field properties for {sectionConfig.label.toLowerCase()} section.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Field Name</Label>
                <Input
                  id="displayName"
                  value={newField.displayName}
                  onChange={(e) => setNewField({ ...newField, displayName: e.target.value })}
                  placeholder="e.g., Building Age, Parking Spots"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Data Type</Label>
                <Select value={newField.type} onValueChange={(value: any) => setNewField({ ...newField, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FIELD_TYPE_CONFIG).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="defaultValue">Default Value (Optional)</Label>
                <Input
                  id="defaultValue"
                  value={newField.defaultValue}
                  onChange={(e) => setNewField({ ...newField, defaultValue: e.target.value })}
                  placeholder={FIELD_TYPE_CONFIG[newField.type]?.placeholder || "Enter default value"}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newField.required}
                  onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                />
                <Label>Required field</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddingField(false)}>
                Cancel
              </Button>
              <Button onClick={editingField ? handleUpdateField : handleSaveField}>
                {editingField ? 'Update' : 'Add'} Field
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="h-6 w-6 mr-3 text-blue-600" />
            Property Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage investment properties and track performance
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            if (open) {
              // Reset all form data when opening create dialog
              createForm.reset({
                name: "",
                description: "",
                location: "",
                city: "",
                state: "",
                totalValue: 0,
                minInvestment: 0,
                expectedReturn: "",
                fundingProgress: 0,
                imageUrls: [],
                propertyType: "residential",
                isActive: true,
                attachments: [],
                customFields: {}
              });
              
              // Reset all form state
              setAttachments([]);
              setGoogleDriveLink("");
              setFileValidationMessage("");
              setShowFileValidation(false);
              setValidationErrors([]);
              
              // Reset custom field values to their default values
              const resetFields: Record<string, any> = {};
              fieldDefinitions.forEach(def => {
                resetFields[def.id] = def.defaultValue || FIELD_TYPE_CONFIG[def.type as keyof typeof FIELD_TYPE_CONFIG]?.defaultValue || '';
              });
              setCustomFields(resetFields);
            }
            setIsCreateOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium px-6 py-2.5 rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-white rounded-2xl shadow-2xl border-0">
            <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 px-8 py-6 mb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Create New Property
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1 text-base">
                    Add a new investment opportunity to the fractOWN platform
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="max-h-[calc(95vh-160px)] overflow-y-auto py-6 px-2 -mx-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg mr-4">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Properties</p>
                <p className="text-3xl font-bold text-blue-900">{propertyStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Active Properties</p>
                <p className="text-3xl font-bold text-green-900">{propertyStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg mr-4">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Total Value</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(propertyStats.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Avg Progress</p>
                <p className="text-3xl font-bold text-orange-900">{propertyStats.avgProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search properties by name, location, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="value-high">Highest Value</SelectItem>
                  <SelectItem value="value-low">Lowest Value</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Property Details</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Financial Info</TableHead>
                  <TableHead className="font-semibold">Progress</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Building className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No properties found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property: Property) => (
                    <TableRow key={property.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-full mr-3">
                            <Building className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{property.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {property.description.slice(0, 60)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium">{property.location}</div>
                            <div className="text-sm text-gray-500">{property.city}, {property.state}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={property.propertyType === "residential" ? "default" : "secondary"} className="capitalize">
                          {property.propertyType === "residential" ? "🏠 Residential" : "🏢 Commercial"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-green-600">
                            {formatCurrency(property.totalValue)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Min: {formatCurrency(property.minInvestment)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${property.fundingProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm font-medium mt-1">{property.fundingProgress}%</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={property.isActive ? "default" : "secondary"} className={
                          property.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600"
                        }>
                          {property.isActive ? "✓ Active" : "○ Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => togglePropertyStatus(property)}
                            className={property.isActive ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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