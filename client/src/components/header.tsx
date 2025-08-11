import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { OTPLoginDialog } from "@/components/auth/otp-login-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();
  const [location, setLocation] = useLocation();

  // Fetch site logo from admin settings
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/admin/settings/site'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings/site');
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get logo URL from settings or fallback
  const logoUrl = siteSettings?.find((setting: any) => setting.key === 'site_logo')?.value || '/attached_assets/logo.jpg';

  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate to home first
    if (location !== '/') {
      setLocation('/');
      // Small delay to allow navigation, then scroll to section
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setShowLoginDialog(true);
    }
    setIsOpen(false);
  };

  const handleLoginSuccess = (userData: any, sessionToken: string) => {
    // Update auth state with user data and session token
    login(userData, sessionToken);
    setShowLoginDialog(false);
  };

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Properties", id: "properties" },
    { label: "How It Works", id: "how-it-works" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-lg shadow-gray-100/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="group flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="relative">
                <img 
                  src={logoUrl} 
                  alt="fractOWN Logo"
                  className="h-20 w-20 object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-fractown-primary/20 to-fractown-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold flex items-center group-hover:scale-105 transition-transform duration-300">
                  <span className="bg-gradient-to-r from-fractown-primary to-blue-600 bg-clip-text text-transparent mr-1">fract</span>
                  <span className="bg-blue-900 text-orange-600 px-2 py-1 font-bold inline-block rounded-md shadow-lg">OWN</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Real Estate Investment</p>
              </div>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-1">
                {navItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                      index === 0 
                        ? "text-gray-900 hover:text-fractown-primary hover:bg-fractown-primary/5" 
                        : "text-gray-600 hover:text-fractown-primary hover:bg-fractown-primary/5"
                    } group`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-fractown-primary/0 to-fractown-accent/0 group-hover:from-fractown-primary/10 group-hover:to-fractown-accent/10 rounded-lg transition-all duration-300"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1.5 bg-gradient-to-r from-fractown-primary/10 to-fractown-accent/10 rounded-full border border-fractown-primary/20">
                    <span className="text-sm text-gray-700">
                      Welcome, <span className="font-semibold text-fractown-primary">{user.name}</span>
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-fractown-primary/30 text-fractown-primary hover:bg-fractown-primary hover:text-white transition-all duration-300 hover:scale-105"
                    onClick={handleLoginClick}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-fractown-primary hover:bg-fractown-primary/5 transition-all duration-300 hover:scale-105 rounded-lg"
                    onClick={handleLoginClick}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-fractown-primary hover:bg-fractown-primary/5 transition-all duration-300 hover:scale-105 rounded-lg" 
                    onClick={() => window.location.href = '/admin/login'}
                  >
                    Admin
                  </Button>
                </>
              )}
              <Button 
                className="group bg-gradient-to-r from-fractown-primary via-blue-600 to-fractown-primary text-white hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl px-6 py-2.5 font-semibold"
                onClick={() => scrollToSection('properties')}
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-fractown-primary transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t pt-4 space-y-2">
                    {isAuthenticated && user ? (
                      <div className="px-3 py-2 space-y-2">
                        <p className="text-sm text-gray-700">
                          Welcome, <span className="font-medium text-fractown-primary">{user.name}</span>
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleLoginClick}
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={handleLoginClick}
                      >
                        Login
                      </Button>
                    )}
                    {!isAuthenticated && (
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-gray-600 hover:text-fractown-primary" 
                        onClick={() => {
                          window.location.href = '/admin/login';
                          setIsOpen(false);
                        }}
                      >
                        Admin
                      </Button>
                    )}
                    <Button 
                      className="w-full bg-fractown-primary text-white hover:bg-fractown-primary/90"
                      onClick={() => {
                        scrollToSection('properties');
                        setIsOpen(false);
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <OTPLoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
        onSuccess={handleLoginSuccess}
      />
    </header>
  );
}
