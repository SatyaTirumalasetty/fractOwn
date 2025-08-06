import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Smartphone, Key, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import TOTPSetupDialog from "./totp-setup-dialog";

export default function AdminSecurityTab() {
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const { toast } = useToast();

  // Get admin TOTP status
  const { data: adminStatus, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/totp/status'],
    queryFn: async () => {
      const sessionToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('adminSessionToken='))
        ?.split('=')[1];
      
      const response = await fetch('/api/admin/totp/status', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch TOTP status');
      return response.json();
    }
  });

  const disableTOTP = async () => {
    try {
      const response = await fetch('/api/admin/totp/disable', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "TOTP authentication disabled successfully"
        });
        refetch();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to disable TOTP",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const totpEnabled = adminStatus?.totpEnabled || false;
  const backupCodesCount = adminStatus?.backupCodesCount || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Two-Factor Authentication (TOTP)
          </CardTitle>
          <CardDescription>
            Secure your admin account with authenticator app-based two-factor authentication for password resets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!totpEnabled ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Not Protected:</strong> Your account is not secured with two-factor authentication.
                Enable TOTP to allow secure password resets using your authenticator app.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Protected:</strong> Two-factor authentication is active. You can reset your password 
                using your authenticator app or backup codes ({backupCodesCount} remaining).
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Authenticator App</h3>
                <p className="text-sm text-gray-600">
                  {totpEnabled ? "Configured and active" : "Not configured"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!totpEnabled ? (
                <Button 
                  onClick={() => setShowTOTPSetup(true)}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Setup TOTP
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTOTPSetup(true)}
                    className="flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    View Backup Codes
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={disableTOTP}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Disable
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Install an authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>• Scan QR code or enter secret manually</li>
              <li>• Use 6-digit codes from your app for secure password resets</li>
              <li>• Keep backup codes safe for emergency access</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Benefits:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• No dependency on SMS or phone network</li>
              <li>• Works offline once configured</li>
              <li>• More secure than SMS-based OTP</li>
              <li>• Industry standard for two-factor authentication</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <TOTPSetupDialog 
        open={showTOTPSetup}
        onOpenChange={(open) => {
          setShowTOTPSetup(open);
          if (!open) refetch(); // Refresh status when dialog closes
        }}
      />
    </div>
  );
}