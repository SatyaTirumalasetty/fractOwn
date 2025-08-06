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
      const response = await apiRequest("POST", "/api/contact", data);
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
    <section id="contact" className="py-16 bg-fractown-primary text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-fractown-accent/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Investing?</h2>
          <p className="text-xl text-blue-100">Get in touch with our investment experts</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="text-fractown-accent text-xl mr-4 w-6 h-6" />
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-blue-100">{contactInfo?.contact_phone || '+91-80-12345678'}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="text-fractown-accent text-xl mr-4 w-6 h-6" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-blue-100">{contactInfo?.contact_email || 'info@fractown.com'}</div>
                </div>
              </div>
              <div className="flex items-center">
                <MessageCircle className="text-fractown-accent text-xl mr-4 w-6 h-6" />
                <div>
                  <div className="font-medium">WhatsApp</div>
                  <div className="text-blue-100">{contactInfo?.whatsapp_number || '+91-9876543210'}</div>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="text-fractown-accent text-xl mr-4 mt-1 w-6 h-6" />
                <div>
                  <div className="font-medium">Address</div>
                  <div className="text-blue-100">
                    {contactInfo?.office_address || 'Koramangala, Bangalore, Karnataka 560034'}
                  </div>
                </div>
              </div>
              {contactInfo?.business_hours && (
                <div className="flex items-start">
                  <Clock className="text-fractown-accent text-xl mr-4 mt-1 w-6 h-6" />
                  <div>
                    <div className="font-medium">Business Hours</div>
                    <div className="text-blue-100">
                      {contactInfo.business_hours}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-white text-fractown-primary rounded-full flex items-center justify-center hover:bg-fractown-accent hover:text-gray-900 transition-colors"
                      aria-label={social.label}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          
          <Card className="bg-white rounded-2xl text-gray-900">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-6">Get Started Today</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
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
                    required
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Investment Amount *</Label>
                  <Select value={formData.investmentAmount} onValueChange={(value) => handleInputChange("investmentAmount", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investment range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5000-25000">₹5,000 - ₹25,000</SelectItem>
                      <SelectItem value="25000-100000">₹25,000 - ₹1,00,000</SelectItem>
                      <SelectItem value="100000-500000">₹1,00,000 - ₹5,00,000</SelectItem>
                      <SelectItem value="500000+">₹5,00,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">Message</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={4}
                    placeholder="Tell us about your investment goals..."
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={submitContactMutation.isPending}
                  className="w-full bg-fractown-primary text-white py-3 font-medium hover:bg-fractown-primary/90 transition-colors"
                >
                  {submitContactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
