import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-fractown text-white">
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
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
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Own Prime Real Estate with{" "}
            <span className="text-fractown-accent">Fractional Investment</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Start your real estate journey with as little as ₹10,000. Invest in premium properties across India and earn regular rental income.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => scrollToSection('properties')}
              className="bg-fractown-accent text-gray-900 px-8 py-4 text-lg font-semibold hover:bg-fractown-accent/90 h-auto"
            >
              Start Investing Today
            </Button>
            <Button 
              onClick={() => scrollToSection('properties')}
              variant="outline"
              className="border border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-fractown-primary h-auto"
            >
              View Properties
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-fractown-accent">₹5,000+</div>
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
