import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MessageCircle, MapPin, Linkedin, Twitter, Instagram, Youtube } from "lucide-react";
import type { ContactInfo, ContactSubmission } from "@shared/schema";

export default function ContactSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    investmentAmount: "",
    message: "",
    preferredContact: "email" as const,
  });

  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const submitContactMutation = useMutation({
    mutationFn: async (data: ContactSubmission) => {
      const response = await fetch("/api/contact-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for your interest. Our team will contact you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        investmentAmount: "",
        message: "",
        preferredContact: "email",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contact-submissions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error('Contact submission error:', error);
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

  return (
    <section id="contact" className="py-16 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Investing?</h2>
          <p className="text-xl text-blue-100">Get in touch with our investment experts</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="text-yellow-400 text-xl mr-4 w-6 h-6" />
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-blue-100">{contactInfo?.contact_phone || '+91-80-12345678'}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="text-yellow-400 text-xl mr-4 w-6 h-6" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-blue-100">{contactInfo?.contact_email || 'info@fractown.com'}</div>
                </div>
              </div>
              <div className="flex items-center">
                <MessageCircle className="text-yellow-400 text-xl mr-4 w-6 h-6" />
                <div>
                  <div className="font-medium">WhatsApp</div>
                  <div className="text-blue-100">{contactInfo?.whatsapp_number || '+91-9876543210'}</div>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="text-yellow-400 text-xl mr-4 mt-1 w-6 h-6" />
                <div>
                  <div className="font-medium">Address</div>
                  <div className="text-blue-100">
                    {contactInfo?.office_address || (
                      <>
                        fractOWN Technologies<br />
                        123 Business District<br />
                        Bangalore, Karnataka 560001<br />
                        India
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Linkedin className="w-6 h-6 text-yellow-400 hover:text-white cursor-pointer" />
                <Twitter className="w-6 h-6 text-yellow-400 hover:text-white cursor-pointer" />
                <Instagram className="w-6 h-6 text-yellow-400 hover:text-white cursor-pointer" />
                <Youtube className="w-6 h-6 text-yellow-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="bg-white text-gray-900 p-8 rounded-lg">
            <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount *
                  </label>
                  <Select onValueChange={(value) => handleInputChange('investmentAmount', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10-25">₹10L - ₹25L</SelectItem>
                      <SelectItem value="25-50">₹25L - ₹50L</SelectItem>
                      <SelectItem value="50-100">₹50L - ₹1Cr</SelectItem>
                      <SelectItem value="100+">₹1Cr+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <Select onValueChange={(value: "email" | "phone" | "whatsapp") => handleInputChange('preferredContact', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Email" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  className="w-full"
                  placeholder="Tell us about your investment goals..."
                />
              </div>

              <Button
                type="submit"
                disabled={submitContactMutation.isPending}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 text-lg font-semibold"
              >
                {submitContactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}