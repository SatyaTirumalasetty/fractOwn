import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/auth/login-dialog";
import { RegisterDialog } from "@/components/auth/register-dialog";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

export default function HeroSection() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const { features } = useFeatureFlags();

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    if (user) {
      scrollToSection('properties');
    } else if (features.enableUserRegistration) {
      setShowRegister(true);
    } else {
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
                src="/attached_assets/image_1754379283931.png" 
                alt="fractOWN Logo"
                className="h-48 w-auto logo-transparent"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gray-900 bg-opacity-40 text-white px-4 py-2 rounded-lg inline-block mb-2">
              Own Prime Real Estate with
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
              className="bg-fractown-accent text-gray-900 px-8 py-4 text-lg font-semibold hover:bg-fractown-accent/90 h-auto"
            >
              {user ? 'Start Investing Today' : features.enableUserRegistration ? 'Get Started' : 'Contact Us'}
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline"
              className="border border-white text-black bg-white px-8 py-4 text-lg font-semibold hover:bg-gray-100 hover:text-fractown-primary h-auto"
            >
              {user ? 'Logout' : 'Login'}
            </Button>
          </div>

          {/* Auth Dialogs */}
          <LoginDialog 
            open={showLogin} 
            onOpenChange={setShowLogin}
            onSwitchToRegister={() => {
              setShowLogin(false);
              if (features.enableUserRegistration) {
                setShowRegister(true);
              }
            }}
            onLoginSuccess={(user) => setUser(user)}
          />
          
          {features.enableUserRegistration && (
            <RegisterDialog 
              open={showRegister} 
              onOpenChange={setShowRegister}
              onSwitchToLogin={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
              onRegisterSuccess={(user) => setUser(user)}
            />
          )}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-fractown-accent">₹10L+</div>
              <div className="text-blue-200">Min Investment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-fractown-accent">8-12%</div>
              <div className="text-blue-200">Expected Returns</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-fractown-accent">50+</div>
              <div className="text-blue-200">Properties Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
