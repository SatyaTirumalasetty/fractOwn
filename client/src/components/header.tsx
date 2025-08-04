import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
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
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img 
                src="/attached_assets/fractOWN_logo1_1754210267276.jpg" 
                alt="fractOWN Logo"
                className="h-20 w-auto"
              />
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
              <Button variant="ghost" className="text-gray-600 hover:text-fractown-primary">
                Login
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-fractown-primary" onClick={() => window.location.href = '/admin/login'}>
                Admin
              </Button>
              <Button className="bg-fractown-primary text-white hover:bg-fractown-primary/90">
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
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                    <Button className="w-full bg-fractown-primary text-white hover:bg-fractown-primary/90">
                      Get Started
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
