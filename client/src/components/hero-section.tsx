import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OTPLoginDialog } from "@/components/auth/otp-login-dialog";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

export default function HeroSection() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const { features } = useFeatureFlags();

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
    <section id="home" className="relative bg-gradient-fractown text-white overflow-hidden min-h-screen flex items-center">
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-fractown-primary/80 via-fractown-secondary/70 to-fractown-accent/60 animate-pulse"></div>
      
      {/* Parallax background image */}
      <div 
        className="absolute inset-0 bg-fixed transform transition-transform duration-1000 hover:scale-105"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-fractown-accent/20 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-lg rotate-45 animate-spin" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-fractown-accent/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-8 h-8 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl">
          {/* Animated logo entrance */}
          <div className="mb-8 flex justify-start">
            <div className="logo-hero transform transition-all duration-1000 hover:scale-110 hover:rotate-2">
              <img 
                src="/attached_assets/image_1754379283931.png" 
                alt="fractOWN Logo"
                className="h-48 w-auto logo-transparent drop-shadow-2xl animate-pulse"
              />
            </div>
          </div>
          
          {/* Enhanced title with proper visibility */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gray-900 bg-opacity-80 text-white px-3 sm:px-4 py-3 rounded-2xl inline-block mb-2 whitespace-nowrap transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20">
              Own Premium Properties with
            </span>{" "}
            <br />
            <span className="text-fractown-accent drop-shadow-lg font-extrabold">
              Fractional Investment
            </span>
          </h1>
          
          {/* Enhanced description with better visibility */}
          <p className="text-xl md:text-2xl mb-8 text-white bg-gray-900 bg-opacity-80 px-6 sm:px-8 py-6 rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
            Start your real estate journey with as little as <span className="text-fractown-accent font-bold">₹10L</span>. Own a fraction of premium properties across India and watch your wealth grow.
          </p>
          {/* Enhanced CTA buttons with modern effects */}
          <div className="flex flex-col sm:flex-row gap-6 mb-12">
            <Button 
              onClick={handleGetStarted}
              data-testid="button-get-started"
              className="bg-gradient-to-r from-fractown-accent to-yellow-400 text-gray-900 px-10 py-6 text-xl font-bold hover:from-yellow-400 hover:to-fractown-accent h-auto transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-fractown-accent/50 rounded-2xl"
            >
              {user ? 'Start Investing Today' : features.enableUserRegistration ? 'Get Started' : 'Contact Us'} 
              <span className="ml-2">→</span>
            </Button>
            <Button 
              onClick={handleLogin}
              data-testid="button-login"
              variant="outline"
              className="border-2 border-white text-white bg-white/10 backdrop-blur-sm px-10 py-6 text-xl font-bold hover:bg-white hover:text-fractown-primary h-auto transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-2xl"
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
          {/* Enhanced statistics with proper visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center bg-gray-900 bg-opacity-80 p-6 rounded-2xl border border-white/30 transform transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-2xl">
              <div className="text-4xl md:text-5xl font-bold text-fractown-accent mb-2">₹10L+</div>
              <div className="text-white font-medium">Min Investment</div>
            </div>
            <div className="text-center bg-gray-900 bg-opacity-80 p-6 rounded-2xl border border-white/30 transform transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-2xl">
              <div className="text-4xl md:text-5xl font-bold text-fractown-accent mb-2">8-12%</div>
              <div className="text-white font-medium">Expected Returns</div>
            </div>
            <div className="text-center bg-gray-900 bg-opacity-80 p-6 rounded-2xl border border-white/30 transform transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-2xl">
              <div className="text-4xl md:text-5xl font-bold text-fractown-accent mb-2">50+</div>
              <div className="text-white font-medium">Properties Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
