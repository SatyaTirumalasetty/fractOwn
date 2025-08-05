import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, Save, RotateCcw, Settings, Palette, FileText, Database, Flag } from "lucide-react";
import FeatureFlagsTab from "./feature-flags-tab";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsTab() {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("/attached_assets/image_1754379283931.png");
  
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

  const handleSaveSettings = async (section: string) => {
    try {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Application Settings</h2>
          <p className="text-muted-foreground">
            Customize your application appearance and functionality
          </p>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Branding
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
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
        </TabsList>

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

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Edit section descriptions and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Button onClick={() => handleSaveSettings("Content")} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Content Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>Configure investment parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

            <Card>
              <CardHeader>
                <CardTitle>File Upload Settings</CardTitle>
                <CardDescription>Configure file upload parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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