import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, MessageCircle, Save, Settings, Globe, Users, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface ContactSetting {
  key: string;
  value: string;
  description?: string;
}

export default function AdminContactSettings() {
  const [settings, setSettings] = useState<ContactSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const contactFields = [
    { key: 'contact_phone', label: 'Contact Phone', icon: Phone, placeholder: '+91-80-12345678' },
    { key: 'contact_email', label: 'Contact Email', icon: Mail, placeholder: 'info@fractown.com' },
    { key: 'support_email', label: 'Support Email', icon: Mail, placeholder: 'support@fractown.com' },
    { key: 'whatsapp_number', label: 'WhatsApp Number', icon: MessageCircle, placeholder: '+91-9876543210' },
    { key: 'business_hours', label: 'Business Hours', icon: Clock, placeholder: 'Mon-Fri: 9:00 AM - 6:00 PM IST' },
    { key: 'office_address', label: 'Office Address', icon: MapPin, placeholder: 'Koramangala, Bangalore, Karnataka 560034' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/contact');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch contact settings:', error);
      toast({
        title: "Error",
        description: "Failed to load contact settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    if (!value.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value: value.trim(),
          category: 'contact'
        }),
      });

      if (response.ok) {
        // Update local state
        setSettings(prev => {
          const existing = prev.find(s => s.key === key);
          if (existing) {
            return prev.map(s => s.key === key ? { ...s, value: value.trim() } : s);
          } else {
            return [...prev, { key, value: value.trim() }];
          }
        });

        toast({
          title: "Success",
          description: "Contact information updated successfully"
        });
      } else {
        throw new Error('Failed to update setting');
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      toast({
        title: "Error",
        description: "Failed to update contact information",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading contact settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-3 text-blue-600" />
            Contact Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Manage how customers can reach your business
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg mr-3">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Active Fields</p>
                <p className="text-2xl font-bold text-green-900">
                  {settings.filter(s => s.value && s.value.trim()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg mr-3">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Fields</p>
                <p className="text-2xl font-bold text-blue-900">{contactFields.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Customer Reach</p>
                <p className="text-2xl font-bold text-purple-900">24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="contact-info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contact-info">Contact Information</TabsTrigger>
          <TabsTrigger value="business-hours">Business Hours</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="contact-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Update the primary contact details displayed on your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {contactFields.slice(0, 4).map((field) => {
                  const IconComponent = field.icon;
                  const currentValue = getCurrentValue(field.key);
                  const hasValue = currentValue && currentValue.trim();
                  
                  return (
                    <div key={field.key} className="group">
                      <Label htmlFor={field.key} className="flex items-center gap-2 text-sm font-medium mb-2">
                        <IconComponent className="h-4 w-4 text-gray-500" />
                        {field.label}
                        {hasValue && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          id={field.key}
                          placeholder={field.placeholder}
                          defaultValue={currentValue}
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            if (newValue !== currentValue) {
                              handleUpdateSetting(field.key, newValue);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              target.blur();
                            }
                          }}
                          className={`pr-10 transition-colors ${hasValue ? 'border-green-300 bg-green-50' : ''}`}
                          disabled={saving}
                        />
                        {hasValue && (
                          <CheckCircle className="h-4 w-4 text-green-500 absolute right-3 top-3" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {saving ? 'Saving...' : 'Auto-saves on change'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business-hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Business Hours & Location
              </CardTitle>
              <CardDescription>
                Set your operating hours and physical location details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {contactFields.slice(4).map((field) => {
                  const IconComponent = field.icon;
                  const currentValue = getCurrentValue(field.key);
                  const hasValue = currentValue && currentValue.trim();
                  
                  return (
                    <div key={field.key} className="group">
                      <Label htmlFor={field.key} className="flex items-center gap-2 text-sm font-medium mb-2">
                        <IconComponent className="h-4 w-4 text-gray-500" />
                        {field.label}
                        {hasValue && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          id={field.key}
                          placeholder={field.placeholder}
                          defaultValue={currentValue}
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            if (newValue !== currentValue) {
                              handleUpdateSetting(field.key, newValue);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              target.blur();
                            }
                          }}
                          className={`pr-10 transition-colors ${hasValue ? 'border-green-300 bg-green-50' : ''}`}
                          disabled={saving}
                        />
                        {hasValue && (
                          <CheckCircle className="h-4 w-4 text-green-500 absolute right-3 top-3" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {saving ? 'Saving...' : 'Auto-saves on change'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Advanced Contact Settings
              </CardTitle>
              <CardDescription>
                Configure advanced contact and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Website Display</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        All contact information will be automatically displayed in the contact section of your website.
                      </p>
                      <Badge variant="outline" className="text-blue-700 border-blue-300">
                        Live Updates
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Auto-Save</h4>
                      <p className="text-sm text-green-800 mb-3">
                        Changes are automatically saved when you finish editing each field. No manual save required.
                      </p>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Always Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">Important Notice</h4>
                      <p className="text-sm text-orange-800">
                        Ensure all contact information is accurate and up-to-date. Customers will use these details to reach your business.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}