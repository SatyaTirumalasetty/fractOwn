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
    <section id="contact" className="py-20 bg-gradient-to-br from-fractown-primary via-blue-700 to-indigo-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 smooth-transition hover:bg-white/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Ready to Start Investing?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Get in touch with our investment experts and begin your real estate investment journey today
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="gpu-accelerated bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 smooth-transition">
              <h3 className="text-3xl font-bold mb-8 text-white">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 smooth-transition">
                  <div className="flex-shrink-0 w-12 h-12 bg-fractown-accent rounded-2xl flex items-center justify-center mr-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Phone</div>
                    <div className="text-blue-100 font-medium">{contactInfo?.contact_phone || '+91-80-12345678'}</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 smooth-transition">
                  <div className="flex-shrink-0 w-12 h-12 bg-fractown-accent rounded-2xl flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Email</div>
                    <div className="text-blue-100 font-medium">{contactInfo?.contact_email || 'info@fractown.com'}</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-white/5 rounded-2xl hover:bg-white/10 smooth-transition">
                  <div className="flex-shrink-0 w-12 h-12 bg-fractown-accent rounded-2xl flex items-center justify-center mr-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">WhatsApp</div>
                    <div className="text-blue-100 font-medium">{contactInfo?.whatsapp_number || '+91-9876543210'}</div>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-white/5 rounded-2xl hover:bg-white/10 smooth-transition">
                  <div className="flex-shrink-0 w-12 h-12 bg-fractown-accent rounded-2xl flex items-center justify-center mr-4 mt-1">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Address</div>
                    <div className="text-blue-100 font-medium">
                      {contactInfo?.office_address || 'Koramangala, Bangalore, Karnataka 560034'}
                    </div>
                  </div>
                </div>
                {contactInfo?.business_hours && (
                  <div className="flex items-start p-4 bg-white/5 rounded-2xl hover:bg-white/10 smooth-transition">
                    <div className="flex-shrink-0 w-12 h-12 bg-fractown-accent rounded-2xl flex items-center justify-center mr-4 mt-1">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Business Hours</div>
                      <div className="text-blue-100 font-medium">
                        {contactInfo.business_hours}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="gpu-accelerated bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/15 smooth-transition">
              <h4 className="text-2xl font-bold mb-6 text-white">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-14 h-14 bg-white/10 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center hover:bg-fractown-accent hover:text-white smooth-transition hover:scale-110 border border-white/20 hover:border-fractown-accent"
                      aria-label={social.label}
                    >
                      <IconComponent className="w-6 h-6" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="gpu-accelerated bg-white/95 backdrop-blur-md rounded-3xl text-gray-900 shadow-2xl border border-white/20 hover:shadow-3xl smooth-transition">
            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-fractown-primary to-blue-600 rounded-2xl mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Get Started Today</h3>
                <p className="text-gray-600 font-medium">Begin your real estate investment journey</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-fractown-primary focus:ring-2 focus:ring-fractown-primary/20 smooth-transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 9876543210"
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-fractown-primary focus:ring-2 focus:ring-fractown-primary/20 smooth-transition"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-3">Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-fractown-primary focus:ring-2 focus:ring-fractown-primary/20 smooth-transition"
                    required
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-3">Investment Amount *</Label>
                  <Select value={formData.investmentAmount} onValueChange={(value) => handleInputChange("investmentAmount", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-fractown-primary focus:ring-2 focus:ring-fractown-primary/20 smooth-transition">
                      <SelectValue placeholder="Select your investment range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-gray-200">
                      <SelectItem value="1000000-2500000" className="rounded-lg">₹10 Lakh - ₹25 Lakh</SelectItem>
                      <SelectItem value="2500000-5000000" className="rounded-lg">₹25 Lakh - ₹50 Lakh</SelectItem>
                      <SelectItem value="5000000-10000000" className="rounded-lg">₹50 Lakh - ₹1 Crore</SelectItem>
                      <SelectItem value="10000000+" className="rounded-lg">₹1 Crore+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-semibold text-gray-700 mb-3">Message</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={4}
                    placeholder="Tell us about your investment goals and preferences..."
                    className="border-2 border-gray-200 rounded-xl focus:border-fractown-primary focus:ring-2 focus:ring-fractown-primary/20 smooth-transition resize-none"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={submitContactMutation.isPending}
                  className="w-full h-14 bg-gradient-to-r from-fractown-primary to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-fractown-primary/90 hover:to-blue-600/90 smooth-transition hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitContactMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Send Message</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
