import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPropertiesTab } from "@/components/admin/admin-properties-tab";
import { AdminContactsTab } from "@/components/admin/admin-contacts-tab";
import AdminSettingsTab from "@/components/admin/admin-settings-tab";
import AdminStatisticsTab from "@/components/admin/admin-statistics-tab";
import AdminHomepageSectionsTab from "@/components/admin/admin-homepage-sections-tab";
import { EnhancedAdminDashboard } from "@/components/admin/enhanced-admin-dashboard";
import { LogOut, Building, MessageSquare, Settings, BarChart3, TrendingUp, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<any>(null);

  // Fetch site logo from admin settings
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/admin/settings/site'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings/site');
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get logo URL from settings or fallback
  const logoUrl = siteSettings?.find((setting: any) => setting.key === 'site_logo')?.value || '/attached_assets/logo.jpg';

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    if (!storedUser) {
      setLocation("/admin/login");
      return;
    }
    setAdminUser(JSON.parse(storedUser));
    
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminSessionToken");
    toast({
      title: "Logged Out", 
      description: "You have been successfully logged out.",
    });
    setLocation("/admin/login");
  };

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img 
                  src={logoUrl} 
                  alt="fractOWN Logo"
                  className="h-20 w-20 object-contain hover:opacity-80 transition-opacity"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold flex items-center">
                  <span className="text-fractown-primary mr-1">fract</span>
                  <span className="bg-fractown-own-bg text-fractown-accent px-1.5 py-0.5 font-bold inline-block">OWN</span>
                </h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-medium text-fractown-primary">{adminUser.username}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm"
                className="text-gray-600 hover:text-fractown-primary border-gray-300"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600">
            Manage properties, view contact inquiries, and monitor platform activity.
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Properties</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Contact Inquiries</span>
            </TabsTrigger>
            <TabsTrigger value="homepage" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Homepage</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <EnhancedAdminDashboard />
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Property Management</CardTitle>
                <CardDescription>
                  Create, edit, and manage all properties on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminPropertiesTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Inquiries</CardTitle>
                <CardDescription>
                  View and manage contact form submissions from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminContactsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homepage">
            <AdminHomepageSectionsTab />
          </TabsContent>

          <TabsContent value="statistics">
            <AdminStatisticsTab />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>
                  Configure branding, themes, content, and system settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSettingsTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}