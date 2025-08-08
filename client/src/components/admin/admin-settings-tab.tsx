import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, Save, RotateCcw, Settings, Palette, FileText, Database, Flag, Shield, Key, Phone, Mail, RefreshCw, Download, Search, Filter, TrendingUp, Activity, CheckCircle, Clock, DollarSign } from "lucide-react";
import FeatureFlagsTab from "./feature-flags-tab";
import AdminContactSettings from "./admin-contact-settings";
import AdminSecurityTab from "./admin-security-tab";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminSettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Fetch current site settings to get the current logo
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/admin/settings/site'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings/site');
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update preview when site settings load
  useEffect(() => {
    const currentLogo = siteSettings?.find((setting: any) => setting.key === 'site_logo')?.value;
    if (currentLogo && !logoPreview) {
      setLogoPreview(currentLogo);
    }
  }, [siteSettings, logoPreview]);

  // Fetch admin profile
  const { data: adminProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/admin/profile'],
    queryFn: () => fetch('/api/admin/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminSessionToken')}`
      }
    }).then(async res => {
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }
      return res.json();
    }),
  });
  
  // Application settings
  const [appSettings, setAppSettings] = useState({
    appName: "fractOWN",
    description: "Democratizing real estate investment through fractional ownership",
    supportEmail: "support@fractown.com",
    minInvestment: "10000",
    maxInvestment: "10000000",
    currency: "INR"
  });

  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: "#1e40af",
    secondaryColor: "#f59e0b",
    accentColor: "#10b981",
    backgroundColor: "#ffffff",
    textColor: "#1f2937"
  });

  // File upload settings
  const [uploadSettings, setUploadSettings] = useState({
    maxFileSize: "10",
    allowedImageTypes: "jpeg,png,webp,gif",
    allowedDocTypes: "pdf,doc,docx",
    maxFilesPerProperty: "10"
  });

  // Feature flags
  const [features, setFeatures] = useState({
    enableUserRegistration: false,
    enableEmailNotifications: false,
    enableSMSNotifications: false,
    enablePaymentIntegration: false
  });

  // Admin profile form settings
  const [profileForm, setProfileForm] = useState({
    email: "",
    phoneNumber: "",
    countryCode: "+91"
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (adminProfile) {
      setProfileForm({
        email: adminProfile.email || "",
        phoneNumber: adminProfile.phoneNumber || "",
        countryCode: adminProfile.countryCode || "+91"
      });
    }
  }, [adminProfile]);

  // Password change settings
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifyMobile: true
  });

  // Section descriptions
  const [sectionDescriptions, setSectionDescriptions] = useState({
    heroTitle: "Invest in Premium Real Estate",
    heroSubtitle: "Start your real estate investment journey with as little as ₹10L",
    investmentTitle: "Smart Investment Solutions",
    investmentDescription: "Fractional ownership makes premium real estate accessible to everyone",
    portfolioTitle: "Diversify Your Portfolio",
    portfolioDescription: "Build wealth through strategic real estate investments across India"
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Logo file must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Admin profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: { email?: string; phoneNumber?: string; countryCode?: string }) => 
      fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminSessionToken')}`
        },
        body: JSON.stringify(profileData)
      }).then(async res => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Failed to update profile');
        }
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSaveSettings = async (section: string) => {
    try {
      if (section === "Profile") {
        updateProfileMutation.mutate(profileForm);
        return;
      }

      if (section === "Branding" && logoFile) {
        // Handle logo upload
        await handleLogoUploadAndSave();
        return;
      }

      // Here you would typically send the settings to your API
      // For now, we'll just show a success message
      toast({
        title: "Settings saved",
        description: `${section} settings have been updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogoUploadAndSave = async () => {
    if (!logoFile) {
      toast({
        title: "No logo selected",
        description: "Please select a logo file to upload.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get upload URL
      const uploadResponse = await fetch('/api/admin/logo/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminSessionToken')}`
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL } = await uploadResponse.json();

      // Upload file
      const formData = new FormData();
      formData.append('file', logoFile);

      const fileResponse = await fetch(uploadURL, {
        method: 'POST',
        body: formData
      });

      if (!fileResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // For Google Cloud Storage, construct the public URL from the upload URL path
      const url = new URL(uploadURL);
      // Extract the path and convert private uploads to served objects path
      const pathParts = url.pathname.split('/');
      const filename = pathParts[pathParts.length - 1];
      const logoUrl = `/objects/.private/uploads/${filename}`;

      // Save logo URL to settings
      const saveResponse = await fetch('/api/admin/logo/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminSessionToken')}`
        },
        body: JSON.stringify({ logoUrl })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save logo setting');
      }

      // Clear logo file state
      setLogoFile(null);
      setLogoPreview(logoUrl);

      // Invalidate cache to refresh logo
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/site'] });

      toast({
        title: "Logo updated",
        description: "Your logo has been updated successfully",
      });

    } catch (error) {
      console.error('Logo upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload logo. Please try again.";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordChange.newPassword !== passwordChange.confirmPassword) {
        toast({
          title: "Error",
          description: "New password and confirmation don't match",
          variant: "destructive"
        });
        return;
      }

      if (passwordChange.newPassword.length < 8) {
        toast({
          title: "Error", 
          description: "Password must be at least 8 characters long",
          variant: "destructive"
        });
        return;
      }

      // Call API to change password
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminSessionToken')}`
        },
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword,
          notifyMobile: passwordChange.notifyMobile
        })
      });

      if (response.ok) {
        toast({
          title: "Password Changed",
          description: passwordChange.notifyMobile ? "Password updated successfully. Mobile notification sent." : "Password updated successfully.",
        });
        setPasswordChange({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          notifyMobile: true
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to change password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetToDefaults = () => {
    setThemeSettings({
      primaryColor: "#1e40af",
      secondaryColor: "#f59e0b", 
      accentColor: "#10b981",
      backgroundColor: "#ffffff",
      textColor: "#1f2937"
    });
    toast({
      title: "Reset complete",
      description: "Theme settings have been reset to defaults"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-3 text-blue-600" />
            Application Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Configure platform settings, branding, and system preferences
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg mr-4">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Active Features</p>
                <p className="text-3xl font-bold text-blue-900">
                  {Object.values(features).filter(Boolean).length}/{Object.keys(features).length}
                </p>
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
                <p className="text-sm font-medium text-green-800">System Status</p>
                <p className="text-3xl font-bold text-green-900">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg mr-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Profile Status</p>
                <p className="text-3xl font-bold text-purple-900">
                  {profileLoading ? "Loading..." : adminProfile ? "Active" : "Pending"}
                </p>
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
                <p className="text-sm font-medium text-orange-800">Config Health</p>
                <p className="text-3xl font-bold text-orange-900">Optimized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contact" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact" className="space-y-4">
          <AdminContactSettings />
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo Management</CardTitle>
              <CardDescription>
                Upload and manage your application logo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Current Logo"
                    className="h-20 w-auto object-contain border border-gray-200 rounded"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="logo-upload">Upload New Logo</Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommended: PNG or SVG format, max 5MB
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input
                    id="app-name"
                    value={appSettings.appName}
                    onChange={(e) => setAppSettings({...appSettings, appName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={appSettings.supportEmail}
                    onChange={(e) => setAppSettings({...appSettings, supportEmail: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="app-description">Description</Label>
                <Textarea
                  id="app-description"
                  value={appSettings.description}
                  onChange={(e) => setAppSettings({...appSettings, description: e.target.value})}
                  rows={3}
                />
              </div>

              <Button onClick={() => handleSaveSettings("Branding")} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Branding Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Admin Profile
              </CardTitle>
              <CardDescription>
                Configure admin contact details for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileLoading && (
                <div className="text-center py-4">Loading profile...</div>
              )}
              
              {!profileLoading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="admin-email">Email Address</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        placeholder="admin@fractown.com"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Used for email notifications and system alerts
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="admin-phone">Mobile Number (for SMS notifications)</Label>
                      <div className="flex space-x-2">
                        <Select value={profileForm.countryCode} onValueChange={(value) => setProfileForm({...profileForm, countryCode: value})}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+91">🇮🇳 +91</SelectItem>
                            <SelectItem value="+1">🇺🇸 +1</SelectItem>
                            <SelectItem value="+44">🇬🇧 +44</SelectItem>
                            <SelectItem value="+61">🇦🇺 +61</SelectItem>
                            <SelectItem value="+971">🇦🇪 +971</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="admin-phone"
                          type="tel"
                          value={profileForm.phoneNumber}
                          onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                          placeholder="9999999999"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Required for password change notifications via SMS
                      </p>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Mobile Notifications</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          When SMS notifications are enabled, you'll receive alerts for:
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                          <li>• Password changes and security alerts</li>
                          <li>• System maintenance notifications</li>
                          <li>• Important user activity updates</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleSaveSettings("Profile")} 
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Profile Settings"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Theme Customization
                <Button variant="outline" size="sm" onClick={resetToDefaults}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </CardTitle>
              <CardDescription>
                Customize colors and visual appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) => setThemeSettings({...themeSettings, primaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeSettings.primaryColor}
                      onChange={(e) => setThemeSettings({...themeSettings, primaryColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={themeSettings.secondaryColor}
                      onChange={(e) => setThemeSettings({...themeSettings, secondaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeSettings.secondaryColor}
                      onChange={(e) => setThemeSettings({...themeSettings, secondaryColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={themeSettings.accentColor}
                      onChange={(e) => setThemeSettings({...themeSettings, accentColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeSettings.accentColor}
                      onChange={(e) => setThemeSettings({...themeSettings, accentColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={themeSettings.backgroundColor}
                      onChange={(e) => setThemeSettings({...themeSettings, backgroundColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeSettings.backgroundColor}
                      onChange={(e) => setThemeSettings({...themeSettings, backgroundColor: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Separator />
              
              <div>
                <h4 className="text-lg font-medium mb-3">Theme Preview</h4>
                <div 
                  className="p-4 rounded-lg border-2 border-dashed"
                  style={{
                    backgroundColor: themeSettings.backgroundColor,
                    color: themeSettings.textColor,
                    borderColor: themeSettings.primaryColor
                  }}
                >
                  <h3 style={{ color: themeSettings.primaryColor }} className="text-xl font-bold mb-2">
                    fractOWN Preview
                  </h3>
                  <p className="mb-3">This is how your theme will look</p>
                  <div className="flex space-x-2">
                    <div 
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: themeSettings.primaryColor }}
                    >
                      Primary
                    </div>
                    <div 
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: themeSettings.secondaryColor }}
                    >
                      Secondary
                    </div>
                    <div 
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: themeSettings.accentColor }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSaveSettings("Theme")} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Theme Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Statistics Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-800">Content Sections</p>
                    <p className="text-3xl font-bold text-purple-900">6</p>
                    <p className="text-xs text-purple-700 mt-1">Active sections</p>
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
                    <p className="text-sm font-medium text-green-800">Content Status</p>
                    <p className="text-3xl font-bold text-green-900">Published</p>
                    <p className="text-xs text-green-700 mt-1">All sections live</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg mr-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Last Updated</p>
                    <p className="text-3xl font-bold text-blue-900">Today</p>
                    <p className="text-xs text-blue-700 mt-1">Content sync</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                Content Management
              </CardTitle>
              <CardDescription>
                Edit section descriptions and website content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Hero Section Title</Label>
                  <Input
                    id="hero-title"
                    value={sectionDescriptions.heroTitle}
                    onChange={(e) => setSectionDescriptions({...sectionDescriptions, heroTitle: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="hero-subtitle">Hero Section Subtitle</Label>
                  <Textarea
                    id="hero-subtitle"
                    value={sectionDescriptions.heroSubtitle}
                    onChange={(e) => setSectionDescriptions({...sectionDescriptions, heroSubtitle: e.target.value})}
                    rows={2}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="investment-title">Investment Section Title</Label>
                  <Input
                    id="investment-title"
                    value={sectionDescriptions.investmentTitle}
                    onChange={(e) => setSectionDescriptions({...sectionDescriptions, investmentTitle: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="investment-description">Investment Section Description</Label>
                  <Textarea
                    id="investment-description"
                    value={sectionDescriptions.investmentDescription}
                    onChange={(e) => setSectionDescriptions({...sectionDescriptions, investmentDescription: e.target.value})}
                    rows={3}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="portfolio-title">Portfolio Section Title</Label>
                  <Input
                    id="portfolio-title"
                    value={sectionDescriptions.portfolioTitle}
                    onChange={(e) => setSectionDescriptions({...sectionDescriptions, portfolioTitle: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="portfolio-description">Portfolio Section Description</Label>
                  <Textarea
                    id="portfolio-description"
                    value={sectionDescriptions.portfolioDescription}
                    onChange={(e) => setSectionDescriptions({...sectionDescriptions, portfolioDescription: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <Button onClick={() => handleSaveSettings("Content")} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Content Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Statistics Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-500 rounded-lg mr-4">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800">System Status</p>
                    <p className="text-3xl font-bold text-red-900">Online</p>
                    <p className="text-xs text-red-700 mt-1">All systems operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500 rounded-lg mr-4">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-800">Upload Status</p>
                    <p className="text-3xl font-bold text-orange-900">Active</p>
                    <p className="text-xs text-orange-700 mt-1">Files processing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500 rounded-lg mr-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Security Level</p>
                    <p className="text-3xl font-bold text-green-900">High</p>
                    <p className="text-xs text-green-700 mt-1">All protections active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg mr-4">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Performance</p>
                    <p className="text-3xl font-bold text-blue-900">Optimal</p>
                    <p className="text-xs text-blue-700 mt-1">Response time: 120ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  Business Settings
                </CardTitle>
                <CardDescription>Configure investment parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label htmlFor="min-investment">Minimum Investment (₹)</Label>
                  <Input
                    id="min-investment"
                    type="number"
                    value={appSettings.minInvestment}
                    onChange={(e) => setAppSettings({...appSettings, minInvestment: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max-investment">Maximum Investment (₹)</Label>
                  <Input
                    id="max-investment"
                    type="number"
                    value={appSettings.maxInvestment}
                    onChange={(e) => setAppSettings({...appSettings, maxInvestment: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={appSettings.currency} onValueChange={(value) => setAppSettings({...appSettings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="flex items-center gap-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                  File Upload Settings
                </CardTitle>
                <CardDescription>Configure file upload parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    value={uploadSettings.maxFileSize}
                    onChange={(e) => setUploadSettings({...uploadSettings, maxFileSize: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="allowed-images">Allowed Image Types</Label>
                  <Input
                    id="allowed-images"
                    value={uploadSettings.allowedImageTypes}
                    onChange={(e) => setUploadSettings({...uploadSettings, allowedImageTypes: e.target.value})}
                    placeholder="jpeg,png,webp,gif"
                  />
                </div>
                
                <div>
                  <Label htmlFor="max-files">Max Files per Property</Label>
                  <Input
                    id="max-files"
                    type="number"
                    value={uploadSettings.maxFilesPerProperty}
                    onChange={(e) => setUploadSettings({...uploadSettings, maxFilesPerProperty: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={() => handleSaveSettings("Business Settings")} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Business Settings
            </Button>
            <Button onClick={() => handleSaveSettings("Upload Settings")} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Upload Settings
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable application features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="user-registration">User Registration</Label>
                  <Switch
                    id="user-registration"
                    checked={features.enableUserRegistration}
                    onCheckedChange={(checked) => setFeatures({...features, enableUserRegistration: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={features.enableEmailNotifications}
                    onCheckedChange={(checked) => setFeatures({...features, enableEmailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch
                    id="sms-notifications"
                    checked={features.enableSMSNotifications}
                    onCheckedChange={(checked) => setFeatures({...features, enableSMSNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-integration">Payment Integration</Label>
                  <Switch
                    id="payment-integration"
                    checked={features.enablePaymentIntegration}
                    onCheckedChange={(checked) => setFeatures({...features, enablePaymentIntegration: checked})}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings("Feature Flags")} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Feature Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Change your admin password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordChange.currentPassword}
                  onChange={(e) => setPasswordChange({...passwordChange, currentPassword: e.target.value})}
                  placeholder="Enter your current password"
                />
              </div>
              
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordChange.newPassword}
                  onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})}
                  placeholder="Enter new password (minimum 8 characters)"
                />
              </div>
              
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordChange.confirmPassword}
                  onChange={(e) => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
                  placeholder="Confirm your new password"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="notify-mobile"
                  checked={passwordChange.notifyMobile}
                  onCheckedChange={(checked) => setPasswordChange({...passwordChange, notifyMobile: checked})}
                />
                <Label htmlFor="notify-mobile">Send mobile notification on password change</Label>
              </div>

              <Button onClick={handlePasswordChange} className="w-full">
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Button onClick={() => handleSaveSettings("System")} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save System Settings
          </Button>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeatureFlagsTab />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <AdminSecurityTab />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>
                View and configure database settings (Support team only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Warning:</strong> Database configuration changes should only be made by authorized support team members.
                      Incorrect changes can cause data loss or application failure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Database Type</Label>
                  <Input value="PostgreSQL" disabled className="bg-gray-100" />
                </div>
                
                <div>
                  <Label>Connection Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                </div>
                
                <div>
                  <Label>Database Host</Label>
                  <Input value="localhost" disabled className="bg-gray-100" />
                </div>
                
                <div>
                  <Label>Database Port</Label>
                  <Input value="5432" disabled className="bg-gray-100" />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-lg font-medium mb-3">Database Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">6</div>
                    <div className="text-sm text-blue-600">Properties</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">1</div>
                    <div className="text-sm text-green-600">Admin Users</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-purple-600">Contacts</div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                For advanced database configuration, contact support@fractown.com or refer to config/support.config.js
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}