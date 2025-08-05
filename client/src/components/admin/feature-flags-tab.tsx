import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

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
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Feature Flags</h3>
        <p className="text-sm text-muted-foreground">
          Enable or disable application features
        </p>
      </div>

      <Separator />

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