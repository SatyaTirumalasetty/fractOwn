import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { OTPLoginDialog } from "./auth/otp-login-dialog";

export default function HeroSection() {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const { data: features } = useQuery({
    queryKey: ["/api/config/features"],
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginSuccess = (userData: any, sessionToken: string) => {
    setShowLogin(false);
  };

  const handleGetStarted = () => {
    if (user) {
      scrollToSection('properties');
    } else if (features?.enableUserRegistration) {
      setShowLogin(true);
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
    <section id="home" className="bg-blue-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <img 
              src="/attached_assets/fractOWN_logo_1754209748656.jpg" 
              alt="fractOWN Logo"
              className="h-16 w-auto mx-auto object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Own Premium Properties with{" "}
            <span className="text-yellow-400">Fractional Investment</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Start your real estate journey with as little as <span className="text-yellow-400 font-bold">₹10L</span>. Own a fraction of premium properties across India and watch your wealth grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={handleGetStarted}
              className="bg-yellow-400 text-blue-900 px-8 py-3 text-lg font-semibold hover:bg-yellow-300"
            >
              {user ? 'Start Investing Today' : features?.enableUserRegistration ? 'Get Started' : 'Contact Us'} 
              <span className="ml-2">→</span>
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold"
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
              <div className="text-4xl font-bold text-yellow-400 mb-2">₹10L+</div>
              <div className="text-blue-100">Min Investment</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">8-12%</div>
              <div className="text-blue-100">Expected Returns</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-blue-100">Properties Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}