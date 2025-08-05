import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Smartphone, MessageCircle } from "lucide-react";

interface OTPLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: any, sessionToken: string) => void;
}

const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
];

export function OTPLoginDialog({ open, onOpenChange, onSuccess }: OTPLoginDialogProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();

  const sendOTPMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; email?: string }) => {
      const fullPhoneNumber = countryCode + phoneNumber;
      return await apiRequest("/api/auth/send-otp", {
        method: "POST",
        body: { phoneNumber: fullPhoneNumber, email: data.email || undefined },
      });
    },
    onSuccess: () => {
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; otp: string; name?: string; countryCode?: string }) => {
      return await apiRequest("/api/auth/verify-otp", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (data: any) => {
      onSuccess(data.user, data.sessionToken);
      onOpenChange(false);
      toast({
        title: "Welcome!",
        description: data.message,
      });
      // Reset form
      setStep("phone");
      setPhoneNumber("");
      setName("");
      setEmail("");
      setOtp("");
      setIsNewUser(false);
    },
    onError: (error: any) => {
      // If user doesn't exist, show name input
      if (error.message.includes("required for new users")) {
        setIsNewUser(true);
        toast({
          title: "New User",
          description: "Please provide your name to complete registration.",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: error.message || "Invalid OTP",
          variant: "destructive",
        });
      }
    },
  });

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    sendOTPMutation.mutate({ phoneNumber, email: email || undefined });
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    const fullPhoneNumber = countryCode + phoneNumber;
    verifyOTPMutation.mutate({
      phoneNumber: fullPhoneNumber,
      otp,
      name: isNewUser ? name : undefined,
      countryCode: isNewUser ? countryCode : undefined,
    });
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setIsNewUser(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="otp-login-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "phone" ? (
              <>
                <Smartphone className="h-5 w-5" />
                Login with Phone
              </>
            ) : (
              <>
                <MessageCircle className="h-5 w-5" />
                Enter Verification Code
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "Enter your phone number to receive a verification code"
              : "We've sent a 6-digit code to your phone"
            }
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country-code">Country</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger data-testid="select-country-code">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.code} {country.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-2 border rounded-md bg-muted text-sm min-w-[80px]">
                  {countryCode}
                </div>
                <Input
                  id="phone"
                  data-testid="input-phone-number"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              data-testid="button-send-otp"
              className="w-full"
              disabled={sendOTPMutation.isPending}
            >
              {sendOTPMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            {isNewUser && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                data-testid="input-otp"  
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
              <p className="text-sm text-muted-foreground">
                Sent to {countryCode} {phoneNumber}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                data-testid="button-back"
                variant="outline"
                onClick={handleBackToPhone}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                data-testid="button-verify-otp"
                className="flex-1"
                disabled={verifyOTPMutation.isPending}
              >
                {verifyOTPMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify & Login
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              data-testid="button-resend-otp"
              onClick={() => sendOTPMutation.mutate({ phoneNumber, email: email || undefined })}
              disabled={sendOTPMutation.isPending}
              className="w-full"
            >
              Resend Code
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}