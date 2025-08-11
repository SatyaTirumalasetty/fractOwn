import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OTPLoginDialog } from "@/components/auth/otp-login-dialog";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { useQuery } from "@tanstack/react-query";

export default function HeroSection() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const { features } = useFeatureFlags();

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
  const logoUrl = siteSettings?.find((setting: any) => setting.key === 'site_logo')?.value || '/attached_assets/image_1754379283931.png';

  useEffect(() => {
    // Check for stored user and session
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('sessionToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setSessionToken(storedToken);
    }
  }, []);

  const logout = async () => {
    try {
      // Call logout API
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      setUser(null);
      setSessionToken(null);
    }
  };

  const handleLoginSuccess = (userData: any, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('sessionToken', token);
    setUser(userData);
    setSessionToken(token);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Add a small delay to ensure DOM is ready, then scroll with offset for header
      setTimeout(() => {
        const headerHeight = 80; // Account for sticky header
        const elementPosition = element.offsetTop - headerHeight;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      scrollToSection('properties');
    } else if (features.enableUserRegistration) {
      setShowLogin(true);
    } else {
      // If registration is disabled, scroll to contact section
      scrollToSection('contact');
    }
  };

  const handleLogin = () => {
    if (user) {
      logout();
    } else {
      setShowLogin(true);
    }
  };

  return (
    <section id="home" className="relative bg-gradient-fractown text-white">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl">
          <div className="mb-8 flex justify-start">
            <div className="logo-hero">
              <img 
                src={logoUrl} 
                alt="fractOWN Logo"
                className="h-48 w-auto logo-transparent"
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gray-900 bg-opacity-40 text-white px-2 sm:px-3 py-2 rounded-lg inline-block mb-2 whitespace-nowrap">
              Own Premium Properties with
            </span>{" "}
            <br />
            <span className="text-fractown-accent">Fractional Investment</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 bg-gray-900 bg-opacity-40 px-6 py-4 rounded-lg">
            Start your real estate journey with as little as ₹10L. Own a fraction of premium properties across India and watch your wealth grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleGetStarted}
              data-testid="button-get-started"
              className="bg-fractown-accent text-gray-900 px-8 py-4 text-lg font-semibold hover:bg-fractown-accent/90 h-auto"
            >
              {user ? 'Start Investing Today' : features.enableUserRegistration ? 'Get Started' : 'Contact Us'}
            </Button>
            <Button 
              onClick={handleLogin}
              data-testid="button-login"
              variant="outline"
              className="border border-white text-black bg-white px-8 py-4 text-lg font-semibold hover:bg-gray-100 hover:text-fractown-primary h-auto"
            >
              {user ? 'Logout' : 'Login'}
            </Button>
          </div>

          {/* Auth Dialogs */}
          <OTPLoginDialog 
            open={showLogin} 
            onOpenChange={setShowLogin}
            onSuccess={handleLoginSuccess}
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-fractown-accent whitespace-nowrap">₹10L+</div>
              <div className="text-blue-200">Min Investment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-fractown-accent whitespace-nowrap">8-12%</div>
              <div className="text-blue-200">Expected Returns</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-fractown-accent whitespace-nowrap">50+</div>
              <div className="text-blue-200">Properties Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
