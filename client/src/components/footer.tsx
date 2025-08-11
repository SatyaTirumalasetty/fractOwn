import { useEffect, useState } from "react";
import { Linkedin, Twitter, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SocialLink {
  icon: any;
  href: string;
  label: string;
}

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Fetch dynamic content
  const { data: footerContent = [] } = useQuery<any[]>({
    queryKey: ["/api/content?section=footer"],
  });

  const { data: riskDisclosureContent = [] } = useQuery<any[]>({
    queryKey: ["/api/content?section=risk_disclosure"],
  });

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
        "Risk Disclosure"
      ]
    }
  ];

  useEffect(() => {
    const fetchSocialSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings/social');
        if (response.ok) {
          const settings = await response.json();
          
          const dynamicSocialLinks: SocialLink[] = [];
          
          // Find each social media setting and add to links if URL exists
          const linkedinSetting = settings.find((s: any) => s.key === 'social_linkedin');
          if (linkedinSetting?.value) {
            dynamicSocialLinks.push({
              icon: Linkedin,
              href: linkedinSetting.value,
              label: "LinkedIn"
            });
          }
          
          const twitterSetting = settings.find((s: any) => s.key === 'social_twitter');
          if (twitterSetting?.value) {
            dynamicSocialLinks.push({
              icon: Twitter,
              href: twitterSetting.value,
              label: "Twitter"
            });
          }
          
          const instagramSetting = settings.find((s: any) => s.key === 'social_instagram');
          if (instagramSetting?.value) {
            dynamicSocialLinks.push({
              icon: Instagram,
              href: instagramSetting.value,
              label: "Instagram"
            });
          }
          
          setSocialLinks(dynamicSocialLinks);
        } else {
          // Fallback to empty array if settings can't be fetched
          setSocialLinks([]);
        }
      } catch (error) {
        console.error('Failed to fetch social settings:', error);
        // Fallback to empty array on error
        setSocialLinks([]);
      }
    };

    fetchSocialSettings();
  }, []);

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/attached_assets/fractOWN_logo1_1754210267276.jpg" 
              alt="fractOWN Logo"
              className="h-28 w-auto mb-4"
            />
            <p className="text-gray-400 mb-4">
              {footerContent.find((c: any) => c.key === 'footer_company_description')?.content || 
               "Democratizing real estate investment through fractional ownership. Start your wealth journey today."}
            </p>
            {socialLinks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-fractown-accent transition-colors"
                        aria-label={social.label}
                      >
                        <IconComponent className="w-6 h-6" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
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
          <div className="mt-4 md:mt-0 space-y-1">
            {riskDisclosureContent.find((c: any) => c.key === 'footer_risk_disclosure_content') && (
              <p className="text-xs max-w-2xl">
                {riskDisclosureContent.find((c: any) => c.key === 'footer_risk_disclosure_content')?.content}
              </p>
            )}
            <div className="flex space-x-4 text-xs">
              <span>
                Email: {footerContent.find((c: any) => c.key === 'footer_contact_email')?.content || 'support@fractown.in'}
              </span>
              <span>
                Phone: {footerContent.find((c: any) => c.key === 'footer_contact_phone')?.content || '+91 98765 43210'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
