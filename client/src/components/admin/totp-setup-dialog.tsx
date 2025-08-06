import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, QrCode, Shield, Key, Copy, Check } from "lucide-react";

interface TOTPSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TOTPSetupDialog({ open, onOpenChange }: TOTPSetupDialogProps) {
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateTOTPSecret = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/totp/generate', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('verify');
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to generate TOTP secret",
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

  const verifyAndEnableTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/totp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: verificationCode })
      });

      const data = await response.json();

      if (response.ok) {
        setBackupCodes(data.backupCodes);
        toast({
          title: "Success",
          description: "TOTP authentication enabled successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid verification code",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const resetDialog = () => {
    setStep('generate');
    setQrCode('');
    setSecret('');
    setVerificationCode('');
    setBackupCodes([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Setup Authenticator App
          </DialogTitle>
          <DialogDescription>
            {step === 'generate' && "Set up two-factor authentication for secure password reset"}
            {step === 'verify' && "Scan QR code with your authenticator app and verify"}
            {backupCodes.length > 0 && "Save these backup codes in a secure place"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'generate' && (
            <div className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  You'll need an authenticator app like:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Google Authenticator</li>
                    <li>Microsoft Authenticator</li>
                    <li>Authy</li>
                    <li>1Password</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {step === 'verify' && !backupCodes.length && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Manual Entry Code</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={secret} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(secret)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Enter 6-digit code from your app</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </div>
          )}

          {backupCodes.length > 0 && (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Save these backup codes!</strong> Use them if you lose access to your authenticator app.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white p-2 rounded border">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Backup Codes
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={resetDialog} disabled={loading}>
            {backupCodes.length > 0 ? "Close" : "Cancel"}
          </Button>
          
          {step === 'generate' && (
            <Button onClick={generateTOTPSecret} disabled={loading}>
              <QrCode className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Generate QR Code"}
            </Button>
          )}
          
          {step === 'verify' && !backupCodes.length && (
            <Button onClick={verifyAndEnableTOTP} disabled={loading}>
              <Shield className="h-4 w-4 mr-2" />
              {loading ? "Verifying..." : "Verify & Enable"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}