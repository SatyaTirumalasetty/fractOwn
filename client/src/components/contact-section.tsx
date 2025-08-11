import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Mail, MapPin, MessageCircle, Linkedin, Twitter, Instagram, Youtube, Clock } from "lucide-react";
import type { InsertContact } from "@shared/schema";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    investmentAmount: "",
    message: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contact information from admin settings
  const { data: contactInfo } = useQuery({
    queryKey: ['/api/contact-info'],
    queryFn: async () => {
      const response = await fetch('/api/contact-info');
      if (!response.ok) {
        throw new Error('Failed to fetch contact info');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const submitContactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("/api/contact", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for your interest. Our team will contact you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        investmentAmount: "",
        message: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.investmentAmount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    submitContactMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  return (
    <section id="contact" className="py-16 gradient-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 glass-effect rounded-2xl mb-4 fast-transition hover:scale-105">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Start Investing?
          </h2>
          <p className="text-lg text-blue-100 max-w-xl mx-auto">
            Get in touch with our investment experts and begin your real estate investment journey today
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-6 will-change-transform">
              <h3 className="text-2xl font-bold mb-6 text-white">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-white/5 rounded-xl fast-transition hover:bg-white/10">
                  <div className="flex-shrink-0 w-10 h-10 gradient-accent rounded-xl flex items-center justify-center mr-3">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">Phone</div>
                    <div className="text-blue-100 text-sm">{contactInfo?.contact_phone || '+91-80-12345678'}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white/5 rounded-xl fast-transition hover:bg-white/10">
                  <div className="flex-shrink-0 w-10 h-10 gradient-accent rounded-xl flex items-center justify-center mr-3">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">Email</div>
                    <div className="text-blue-100 text-sm">{contactInfo?.contact_email || 'info@fractown.com'}</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white/5 rounded-xl fast-transition hover:bg-white/10">
                  <div className="flex-shrink-0 w-10 h-10 gradient-accent rounded-xl flex items-center justify-center mr-3">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">WhatsApp</div>
                    <div className="text-blue-100 text-sm">{contactInfo?.whatsapp_number || '+91-9876543210'}</div>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-white/5 rounded-xl fast-transition hover:bg-white/10">
                  <div className="flex-shrink-0 w-10 h-10 gradient-accent rounded-xl flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">Address</div>
                    <div className="text-blue-100 text-sm">
                      {contactInfo?.office_address || 'Koramangala, Bangalore, Karnataka 560034'}
                    </div>
                  </div>
                </div>
                {contactInfo?.business_hours && (
                  <div className="flex items-start p-3 bg-white/5 rounded-xl fast-transition hover:bg-white/10">
                    <div className="flex-shrink-0 w-10 h-10 gradient-accent rounded-xl flex items-center justify-center mr-3">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">Business Hours</div>
                      <div className="text-blue-100 text-sm">
                        {contactInfo.business_hours}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="glass-effect rounded-2xl p-6">
              <h4 className="text-xl font-bold mb-4 text-white">Follow Us</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-white/10 text-white rounded-lg flex items-center justify-center fast-transition hover:bg-fractown-accent hover:scale-105 will-change-transform"
                      aria-label={social.label}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl text-gray-900 rich-shadow will-change-transform">
            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 gradient-primary rounded-xl mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-1 text-gradient">Get Started Today</h3>
                <p className="text-gray-600 text-sm">Begin your real estate investment journey</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="h-10 border border-gray-300 rounded-lg focus:border-fractown-primary fast-transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 9876543210"
                      className="h-10 border border-gray-300 rounded-lg focus:border-fractown-primary fast-transition"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    className="h-10 border border-gray-300 rounded-lg focus:border-fractown-primary fast-transition"
                    required
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount *</Label>
                  <Select value={formData.investmentAmount} onValueChange={(value) => handleInputChange("investmentAmount", value)}>
                    <SelectTrigger className="h-10 border border-gray-300 rounded-lg focus:border-fractown-primary fast-transition">
                      <SelectValue placeholder="Select your investment range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="1000000-2500000">₹10 Lakh - ₹25 Lakh</SelectItem>
                      <SelectItem value="2500000-5000000">₹25 Lakh - ₹50 Lakh</SelectItem>
                      <SelectItem value="5000000-10000000">₹50 Lakh - ₹1 Crore</SelectItem>
                      <SelectItem value="10000000+">₹1 Crore+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Message</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={3}
                    placeholder="Tell us about your investment goals..."
                    className="border border-gray-300 rounded-lg focus:border-fractown-primary fast-transition resize-none"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={submitContactMutation.isPending}
                  className="w-full h-11 gradient-primary text-white font-medium rounded-lg fast-transition hover:opacity-90 rich-shadow disabled:opacity-50"
                >
                  {submitContactMutation.isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Send Message</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
