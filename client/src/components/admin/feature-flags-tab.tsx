import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Flag, Settings, TrendingUp, Activity, CheckCircle, RefreshCw, Download, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

interface FeatureFlags {
  enableUserRegistration: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enablePaymentIntegration: boolean;
}

export default function FeatureFlagsTab() {
  const [features, setFeatures] = useState<FeatureFlags>({
    enableUserRegistration: false,
    enableEmailNotifications: false,
    enableSMSNotifications: false,
    enablePaymentIntegration: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const fetchFeatureFlags = async () => {
    try {
      const response = await fetch('/api/config/features');
      if (response.ok) {
        const data = await response.json();
        setFeatures(data);
      }
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
    }
  };

  const updateFeatureFlag = (key: keyof FeatureFlags, value: boolean) => {
    setFeatures(prev => ({ ...prev, [key]: value }));
  };

  const saveFeatureFlags = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/config/features', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(features),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Feature flags updated successfully",
        });
      } else {
        throw new Error('Failed to update feature flags');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feature flags",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enabledFeatures = Object.values(features).filter(Boolean).length;
  const totalFeatures = Object.keys(features).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Flag className="h-6 w-6 mr-3 text-blue-600" />
            Feature Flags
          </h2>
          <p className="text-gray-600 mt-1">
            Control platform features and experimental functionality
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchFeatureFlags}>
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
                <Flag className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Features</p>
                <p className="text-3xl font-bold text-blue-900">{totalFeatures}</p>
                <p className="text-xs text-blue-700 mt-1">Available flags</p>
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
                <p className="text-sm font-medium text-green-800">Enabled Features</p>
                <p className="text-3xl font-bold text-green-900">{enabledFeatures}</p>
                <p className="text-xs text-green-700 mt-1">Active now</p>
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
                <p className="text-sm font-medium text-purple-800">Activation Rate</p>
                <p className="text-3xl font-bold text-purple-900">{Math.round((enabledFeatures / totalFeatures) * 100)}%</p>
                <p className="text-xs text-purple-700 mt-1">Feature usage</p>
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
                <p className="text-sm font-medium text-orange-800">System Status</p>
                <p className="text-3xl font-bold text-orange-900">Healthy</p>
                <p className="text-xs text-orange-700 mt-1">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Control user registration and authentication features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="user-registration">User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to create accounts
                </p>
              </div>
              <Switch
                id="user-registration"
                checked={features.enableUserRegistration}
                onCheckedChange={(checked) => updateFeatureFlag('enableUserRegistration', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure notification systems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications to users
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={features.enableEmailNotifications}
                onCheckedChange={(checked) => updateFeatureFlag('enableEmailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send SMS notifications to users
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={features.enableSMSNotifications}
                onCheckedChange={(checked) => updateFeatureFlag('enableSMSNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Integration</CardTitle>
            <CardDescription>
              Enable payment processing features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="payment-integration">Payment Processing</Label>
                <p className="text-sm text-muted-foreground">
                  Enable payment gateway integration
                </p>
              </div>
              <Switch
                id="payment-integration"
                checked={features.enablePaymentIntegration}
                onCheckedChange={(checked) => updateFeatureFlag('enablePaymentIntegration', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={saveFeatureFlags} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}