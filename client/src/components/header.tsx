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
  const logoUrl = siteSettings?.find((setting: any) => setting.key === 'site_logo')?.value || '/attached_assets/fractOWN_logo1_1754210267276.jpg';

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
    <header className="bg-gray-50 shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
              <img 
                src={logoUrl} 
                alt="fractOWN Logo"
                className="h-20 w-20 object-contain hover:opacity-80 transition-opacity"
              />
            </div>
            <div className="flex flex-col cursor-pointer" onClick={() => scrollToSection('home')}>
              <h1 className="text-2xl font-bold text-[#1E3A8A]">
                fract<span className="text-[#FF6B35]">OWN</span>
              </h1>
              <p className="text-sm text-gray-600">Real Estate Investment</p>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      index === 0 
                        ? "text-gray-900 hover:text-fractown-primary" 
                        : "text-gray-600 hover:text-fractown-primary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    Welcome, <span className="font-medium text-fractown-primary">{user.name}</span>
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-gray-600 hover:text-fractown-primary border-gray-300"
                    onClick={handleLoginClick}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-fractown-primary"
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
              )}
              {!isAuthenticated && (
                <Button variant="ghost" className="text-gray-600 hover:text-fractown-primary" onClick={() => window.location.href = '/admin/login'}>
                  Admin
                </Button>
              )}
              <Button 
                className="bg-fractown-primary text-white hover:bg-fractown-primary/90"
                onClick={() => scrollToSection('properties')}
              >
                Get Started
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
