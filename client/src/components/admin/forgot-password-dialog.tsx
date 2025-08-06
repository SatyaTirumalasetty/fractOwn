import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Phone, Key, Shield, Clock } from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<'username' | 'otp' | 'password'>('username');
  const [formData, setFormData] = useState({
    username: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [maskedPhone, setMaskedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  // Reset form and dialog state
  const resetDialog = () => {
    setStep('username');
    setFormData({
      username: '',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMaskedPhone('');
    setTimeLeft(0);
    onOpenChange(false);
  };

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    if (!formData.username.trim()) {
      toast({
        title: "Error",
        description: "Please enter your username",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setMaskedPhone(data.phoneNumber);
        setStep('otp');
        setTimeLeft(600); // 10 minutes countdown
        
        // Start countdown timer
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast({
          title: "OTP Sent",
          description: `A 6-digit OTP has been sent to ${data.phoneNumber}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
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

  // Step 3: Reset password
  const handleResetPassword = async () => {
    if (!formData.otp.trim() || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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

    setLoading(true);
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          otp: formData.otp.trim(),
          newPassword: formData.newPassword
        })
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Reset Admin Password
          </DialogTitle>
          <DialogDescription>
            {step === 'username' && "Enter your admin username to receive an OTP"}
            {step === 'otp' && "Enter the OTP sent to your registered mobile number"}
            {step === 'password' && "Enter your new password"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'username' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your admin username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                />
              </div>
              <Alert>
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  An OTP will be sent to your registered mobile number for verification.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <Alert>
                <Phone className="h-4 w-4" />
                <AlertDescription>
                  OTP sent to {maskedPhone}
                  {timeLeft > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span>Expires in: {formatTime(timeLeft)}</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
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
                  onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={resetDialog} disabled={loading}>
            Cancel
          </Button>
          
          {step === 'username' && (
            <Button onClick={handleRequestOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          )}
          
          {step === 'otp' && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('username')}
                disabled={loading}
              >
                Back
              </Button>
              <Button onClick={handleResetPassword} disabled={loading}>
                <Key className="h-4 w-4 mr-2" />
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}