import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Shield, Key, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TOTPPasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TOTPPasswordResetDialog({ open, onOpenChange }: TOTPPasswordResetDialogProps) {
  const [formData, setFormData] = useState({
    username: '',
    totpCode: '',
    backupCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('totp');
  const { toast } = useToast();

  const resetDialog = () => {
    setFormData({
      username: '',
      totpCode: '',
      backupCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setActiveTab('totp');
    onOpenChange(false);
  };

  const handlePasswordReset = async () => {
    if (!formData.username.trim() || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    const authCode = activeTab === 'totp' ? formData.totpCode.trim() : formData.backupCode.trim();
    if (!authCode) {
      toast({
        title: "Error",
        description: activeTab === 'totp' ? "Please enter TOTP code" : "Please enter backup code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        username: formData.username.trim(),
        newPassword: formData.newPassword,
        ...(activeTab === 'totp' 
          ? { totpCode: formData.totpCode.trim() }
          : { backupCode: formData.backupCode.trim() }
        )
      };

      const response = await fetch('/api/admin/forgot-password-totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password reset successfully. You can now login with your new password.",
        });
        resetDialog();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Reset Password with Authenticator
          </DialogTitle>
          <DialogDescription>
            Use your authenticator app or backup codes to reset your password securely
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your admin username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="totp" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Authenticator
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Backup Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="totp" className="space-y-4 mt-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Open your authenticator app and enter the 6-digit code for fractOWN Admin
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="totp-code">6-digit TOTP Code</Label>
                <Input
                  id="totp-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={formData.totpCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, totpCode: e.target.value.replace(/\D/g, '') }))}
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4 mt-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Enter one of your 8-character backup codes. This code will be consumed after use.
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="backup-code">Backup Code</Label>
                <Input
                  id="backup-code"
                  type="text"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  value={formData.backupCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, backupCode: e.target.value.toUpperCase() }))}
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (min 8 chars)"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={resetDialog} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handlePasswordReset} disabled={loading}>
            <Shield className="h-4 w-4 mr-2" />
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}