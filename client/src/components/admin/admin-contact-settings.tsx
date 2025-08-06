import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, MessageCircle, Save } from "lucide-react";

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
      <div>
        <h3 className="text-lg font-medium mb-2">Contact Information</h3>
        <p className="text-sm text-gray-600 mb-6">
          Update the contact information displayed on your homepage
        </p>
      </div>

      <div className="grid gap-6">
        {contactFields.map((field) => {
          const IconComponent = field.icon;
          const currentValue = getCurrentValue(field.key);
          
          return (
            <Card key={field.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-medium">{field.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
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
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter or click outside to save changes
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-1">
            <Phone className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Contact Information Display</h4>
            <p className="text-xs text-blue-700">
              These contact details will be displayed in the contact section of your homepage. 
              Make sure all information is accurate and up-to-date for your customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}