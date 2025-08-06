import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Home, ArrowLeft, Key, Smartphone } from "lucide-react";
import ForgotPasswordDialog from "@/components/admin/forgot-password-dialog";
import TOTPPasswordResetDialog from "@/components/admin/totp-password-reset-dialog";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showTOTPReset, setShowTOTPReset] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Store admin session token and user info
      localStorage.setItem("adminSessionToken", data.sessionToken);
      localStorage.setItem("adminUser", JSON.stringify({ username: "admin" }));
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: any) => {
      setError(error.message || "Login failed");
    },
  });

  const onSubmit = (data: LoginForm) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 top-0"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the fractOWN admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="input-admin-username"
                type="text"
                {...form.register("username")}
                placeholder="Enter your username"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="input-admin-password"
                type="password"
                {...form.register("password")}
                placeholder="Enter your password"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="button-admin-login"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-4 text-center space-y-2">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="link"
                size="sm"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setShowForgotPassword(true)}
              >
                <Key className="h-4 w-4 mr-1" />
                Forgot Password? (SMS)
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-sm text-green-600 hover:text-green-800"
                onClick={() => setShowTOTPReset(true)}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Reset with Authenticator
              </Button>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-gray-600 hover:text-gray-900"
                onClick={() => setLocation("/")}
              >
                <Home className="h-4 w-4 mr-1" />
                Visit as Guest
              </Button>
              <span>•</span>
              <span>Admin Access Required</span>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Only authorized administrators can access the dashboard
            </p>
          </div>

        </CardContent>
      </Card>
      
      <ForgotPasswordDialog 
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
      
      <TOTPPasswordResetDialog 
        open={showTOTPReset}
        onOpenChange={setShowTOTPReset}
      />
    </div>
  );
}