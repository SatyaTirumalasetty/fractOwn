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
    <section id="home" className="bg-gradient-fractown text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <img 
              src="/attached_assets/fractOWN_logo_1754209748656.jpg" 
              alt="fractOWN Logo"
              className="h-20 w-auto mx-auto object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Own Premium Properties with{" "}
            <span className="text-fractown-accent">Fractional Investment</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Start your real estate journey with as little as <span className="text-fractown-accent font-bold">₹10L</span>. Own a fraction of premium properties across India and watch your wealth grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button 
              onClick={handleGetStarted}
              data-testid="button-get-started"
              className="bg-fractown-accent text-gray-900 px-8 py-3 text-lg font-semibold hover:bg-yellow-400"
            >
              {user ? 'Start Investing Today' : features.enableUserRegistration ? 'Get Started' : 'Contact Us'} 
              <span className="ml-2">→</span>
            </Button>
            <Button 
              onClick={handleLogin}
              data-testid="button-login"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-fractown-primary px-8 py-3 text-lg font-semibold"
            >
              {user ? 'Logout' : 'Login'}
            </Button>
          </div>

          <OTPLoginDialog 
            open={showLogin} 
            onOpenChange={setShowLogin}
            onSuccess={handleLoginSuccess}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-fractown-accent mb-2">₹10L+</div>
              <div className="text-blue-100">Min Investment</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-fractown-accent mb-2">8-12%</div>
              <div className="text-blue-100">Expected Returns</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-fractown-accent mb-2">50+</div>
              <div className="text-blue-100">Properties Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
