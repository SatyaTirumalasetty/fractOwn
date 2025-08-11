import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OTPLoginDialog } from "@/components/auth/otp-login-dialog";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import { useQuery } from "@tanstack/react-query";

export default function HeroSection() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
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
          <div className="flex flex-col sm:flex-row gap-6">
            <Button 
              onClick={handleGetStarted}
              data-testid="button-get-started"
              className="group bg-gradient-to-r from-fractown-accent via-orange-400 to-fractown-accent text-gray-900 px-10 py-5 text-lg font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 h-auto rounded-xl border-2 border-fractown-accent/20"
            >
              <span className="flex items-center gap-2">
                {user ? 'Start Investing Today' : features.enableUserRegistration ? 'Get Started' : 'Contact Us'}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>
            <Button 
              onClick={handleLogin}
              data-testid="button-login"
              variant="outline"
              className="group border-2 border-white/80 backdrop-blur-sm text-white bg-white/10 px-10 py-5 text-lg font-bold hover:bg-white hover:text-gray-900 hover:shadow-2xl hover:scale-105 transition-all duration-300 h-auto rounded-xl"
            >
              <span className="flex items-center gap-2">
                {user ? 'Logout' : 'Login'}
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </span>
            </Button>
          </div>

          {/* Auth Dialogs */}
          <OTPLoginDialog 
            open={showLogin} 
            onOpenChange={setShowLogin}
            onSuccess={handleLoginSuccess}
          />
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-fractown-accent/50 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-fractown-accent mb-2 group-hover:scale-110 transition-transform duration-300">₹10L+</div>
              <div className="text-blue-100 font-medium">Min Investment</div>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-fractown-accent/50 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-fractown-accent mb-2 group-hover:scale-110 transition-transform duration-300">8-12%</div>
              <div className="text-blue-100 font-medium">Expected Returns</div>
            </div>
            <div className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-fractown-accent/50 transition-all duration-300 hover:scale-105">
              <div className="text-4xl font-bold text-fractown-accent mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
              <div className="text-blue-100 font-medium">Properties Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
