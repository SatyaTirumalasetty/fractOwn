import { Linkedin, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const footerSections = [
    {
      title: "Investment",
      links: [
        "Browse Properties",
        "Investment Calculator",
        "Portfolio Dashboard",
        "Secondary Market"
      ]
    },
    {
      title: "Company",
      links: [
        "About Us",
        "How It Works",
        "Team",
        "Careers"
      ]
    },
    {
      title: "Legal",
      links: [
        "Terms of Service",
        "Privacy Policy",
        "Risk Disclosure",
        "SEBI Compliance"
      ]
    }
  ];

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/attached_assets/fractOWN_logo_1754209748656.jpg" 
              alt="fractOWN Logo"
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-400 mb-4">
              Democratizing real estate investment through fractional ownership. Start your wealth journey today.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-fractown-accent transition-colors"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>
          
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-gray-400">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href="#" className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <hr className="border-gray-700 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div>
            <p>&copy; 2024 fractOWN Technologies Pvt. Ltd. All rights reserved.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <p>SEBI Registration: AIF/XXX/XXXX | CIN: U74999MH2023PTC123456</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
