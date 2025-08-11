import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Save, 
  FileText, 
  Users, 
  TrendingUp, 
  Shield, 
  Home,
  Star,
  Building2,
  MessageSquare,
  PlusCircle,
  Minus,
  Palette
} from 'lucide-react';

interface ContentSection {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  content?: any;
  enabled: boolean;
}

interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    steps: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  whyChoose: {
    title: string;
    benefits: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  testimonials: {
    title: string;
    subtitle: string;
    reviews: Array<{
      name: string;
      role: string;
      location: string;
      rating: number;
      comment: string;
      avatar?: string;
    }>;
  };
  about: {
    title: string;
    description: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
    certifications: Array<{
      title: string;
      icon: string;
    }>;
    monthlyReturns: {
      amount: string;
      period: string;
    };
  };
  riskDisclosure: {
    title: string;
    points: string[];
    registrationInfo: string;
  };
  footer: {
    companyInfo: string;
    registrationDetails: string;
  };
}

const defaultContent: SiteContent = {
  hero: {
    title: "Invest in Premium Real Estate with Fractional Ownership",
    subtitle: "Start your real estate investment journey with as little as ₹10 Lakhs",
    ctaText: "Get Started"
  },
  howItWorks: {
    title: "How Fractional Ownership Works",
    subtitle: "Simple steps to start your real estate investment journey",
    steps: [
      {
        title: "Browse Properties",
        description: "Explore vetted properties across major Indian cities with detailed financial and projections",
        icon: "🔍"
      },
      {
        title: "Calculate Returns",
        description: "Use our investment calculator to determine your share size and expected returns",
        icon: "📊"
      },
      {
        title: "Invest Securely",
        description: "Complete KYC verification and invest with secure payment methods starting from ₹5,000",
        icon: "💳"
      },
      {
        title: "Earn Returns",
        description: "Benefit from property appreciation and market growth over time",
        icon: "📈"
      }
    ]
  },
  whyChoose: {
    title: "Why Choose Fractional Ownership?",
    benefits: [
      {
        title: "Lower Entry Barrier",
        description: "Start with as little as ₹5,000 instead of crores for full property ownership",
        icon: "✅"
      },
      {
        title: "Diversified Portfolio",
        description: "Spread investments across multiple properties and locations to reduce risk",
        icon: "✅"
      },
      {
        title: "Professional Management",
        description: "No tenant hassles - we handle everything from maintenance to rent collection",
        icon: "✅"
      },
      {
        title: "High Liquidity",
        description: "Trade your fractional shares on our secondary marketplace",
        icon: "✅"
      }
    ]
  },
  testimonials: {
    title: "What Our Investors Say",
    subtitle: "Real stories from successful fractional property investors",
    reviews: [
      {
        name: "Priya Sharma",
        role: "Software Engineer",
        location: "Bangalore",
        rating: 5,
        comment: "I started with just ₹25,000 and my investment has grown significantly. fractOWN made real estate investment so accessible for someone like me.",
        avatar: ""
      },
      {
        name: "Rajesh Kumar",
        role: "Marketing Manager",
        location: "Mumbai",
        rating: 5,
        comment: "The transparency and professional management is outstanding. I can track my investments and returns in real-time. Already planning my next investment!",
        avatar: ""
      },
      {
        name: "Anjali Patel",
        role: "Financial Advisor",
        location: "Pune",
        rating: 5,
        comment: "Diversifying across 5 properties has given me excellent returns and portfolio growth. Much better than my fixed deposits!",
        avatar: ""
      }
    ]
  },
  about: {
    title: "About fractOWN",
    description: "We're democratizing real estate investment in India by making premium properties accessible to everyone. Our mission is to enable wealth creation through fractional property ownership.",
    stats: [
      { value: "₹500 Cr+", label: "Assets Under Management" },
      { value: "15,000+", label: "Happy Investors" },
      { value: "50+", label: "Properties Listed" },
      { value: "8 Cities", label: "Across India" }
    ],
    certifications: [
      { title: "SEBI Registered", icon: "🏛️" },
      { title: "Bank Grade Security", icon: "🔒" },
      { title: "ISO 27001 Certified", icon: "✅" }
    ],
    monthlyReturns: {
      amount: "₹8,500",
      period: "Per ₹1 Lakh Invested"
    }
  },
  riskDisclosure: {
    title: "Investment Risk Disclosure",
    points: [
      "Real estate investments are subject to market risks and regulatory changes that may affect returns.",
      "Past performance does not guarantee future results. Property values may fluctuate based on market conditions.",
      "Rental income is not guaranteed and may vary based on occupancy rates and market demand.",
      "Fractional ownership investments may have limited liquidity compared to traditional securities.",
      "Please read all investment documents carefully and consult with financial advisors before investing.",
      "fractOWN is registered with SEBI as an Alternative Investment Fund (AIF) - Registration No: AIF/XXX/XXXX."
    ],
    registrationInfo: "fractOWN is registered with SEBI as an Alternative Investment Fund (AIF) - Registration No: AIF/XXX/XXXX."
  },
  footer: {
    companyInfo: "© 2024 fractOWN Technologies Pvt. Ltd. All rights reserved.",
    registrationDetails: "SEBI Registration: AIF/XXX/XXXX | CIN: U74999MH2023PTC123456"
  }
};

export function ContentManagementTab() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [activeSection, setActiveSection] = useState('hero');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load content from API
  const { data: savedContent, isLoading } = useQuery({
    queryKey: ['/api/admin/site-content'],
  });

  useEffect(() => {
    if (savedContent) {
      setContent({ ...defaultContent, ...savedContent });
    }
  }, [savedContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminSessionToken')}`
        },
        body: JSON.stringify(content)
      });

      if (!response.ok) throw new Error('Failed to save content');

      await queryClient.invalidateQueries({ queryKey: ['/api/admin/site-content'] });
      
      toast({
        title: "Success",
        description: "Site content updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save content changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = (section: keyof SiteContent, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const addArrayItem = (section: keyof SiteContent, field: string, newItem: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: [...((prev[section] as any)[field] || []), newItem]
      }
    }));
  };

  const removeArrayItem = (section: keyof SiteContent, field: string, index: number) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: (prev[section] as any)[field].filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const updateArrayItem = (section: keyof SiteContent, field: string, index: number, updatedItem: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: (prev[section] as any)[field].map((item: any, i: number) => i === index ? updatedItem : item)
      }
    }));
  };

  if (isLoading) {
    return <div className="p-6">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Content Management</h3>
          <p className="text-sm text-gray-500">
            Manage all website content sections including text, images, and layout
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero" className="flex items-center space-x-1">
            <Home className="h-4 w-4" />
            <span>Hero</span>
          </TabsTrigger>
          <TabsTrigger value="howItWorks" className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" />
            <span>How it Works</span>
          </TabsTrigger>
          <TabsTrigger value="whyChoose" className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span>Why Choose</span>
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>Testimonials</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center space-x-1">
            <Building2 className="h-4 w-4" />
            <span>About</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>Legal</span>
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Hero Section</CardTitle>
              <CardDescription>Main landing page content and call-to-action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Main Title</Label>
                <Input
                  id="hero-title"
                  value={content.hero.title}
                  onChange={(e) => updateContent('hero', 'title', e.target.value)}
                  placeholder="Enter hero title"
                />
              </div>
              <div>
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={content.hero.subtitle}
                  onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                  placeholder="Enter hero subtitle"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="hero-cta">Call-to-Action Button Text</Label>
                <Input
                  id="hero-cta"
                  value={content.hero.ctaText}
                  onChange={(e) => updateContent('hero', 'ctaText', e.target.value)}
                  placeholder="Enter CTA button text"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* How It Works Section */}
        <TabsContent value="howItWorks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">How It Works Section</CardTitle>
              <CardDescription>Step-by-step process explanation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="how-title">Section Title</Label>
                <Input
                  id="how-title"
                  value={content.howItWorks.title}
                  onChange={(e) => updateContent('howItWorks', 'title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="how-subtitle">Section Subtitle</Label>
                <Input
                  id="how-subtitle"
                  value={content.howItWorks.subtitle}
                  onChange={(e) => updateContent('howItWorks', 'subtitle', e.target.value)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Process Steps</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('howItWorks', 'steps', { title: '', description: '', icon: '🔍' })}
                    className="text-[#FF6B35] border-[#FF6B35] hover:bg-[#FF6B35]/10"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                
                {content.howItWorks.steps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[#1E3A8A]">Step {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('howItWorks', 'steps', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>Icon</Label>
                          <Input
                            value={step.icon}
                            onChange={(e) => updateArrayItem('howItWorks', 'steps', index, { ...step, icon: e.target.value })}
                            placeholder="🔍"
                          />
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => updateArrayItem('howItWorks', 'steps', index, { ...step, title: e.target.value })}
                            placeholder="Step title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={step.description}
                            onChange={(e) => updateArrayItem('howItWorks', 'steps', index, { ...step, description: e.target.value })}
                            placeholder="Step description"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Why Choose Section */}
        <TabsContent value="whyChoose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Why Choose Us Section</CardTitle>
              <CardDescription>Benefits and advantages of your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="why-title">Section Title</Label>
                <Input
                  id="why-title"
                  value={content.whyChoose.title}
                  onChange={(e) => updateContent('whyChoose', 'title', e.target.value)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Benefits</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('whyChoose', 'benefits', { title: '', description: '', icon: '✅' })}
                    className="text-[#FF6B35] border-[#FF6B35] hover:bg-[#FF6B35]/10"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Benefit
                  </Button>
                </div>
                
                {content.whyChoose.benefits.map((benefit, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[#1E3A8A]">Benefit {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('whyChoose', 'benefits', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>Icon</Label>
                          <Input
                            value={benefit.icon}
                            onChange={(e) => updateArrayItem('whyChoose', 'benefits', index, { ...benefit, icon: e.target.value })}
                            placeholder="✅"
                          />
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={benefit.title}
                            onChange={(e) => updateArrayItem('whyChoose', 'benefits', index, { ...benefit, title: e.target.value })}
                            placeholder="Benefit title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={benefit.description}
                            onChange={(e) => updateArrayItem('whyChoose', 'benefits', index, { ...benefit, description: e.target.value })}
                            placeholder="Benefit description"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Section */}
        <TabsContent value="testimonials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Testimonials Section</CardTitle>
              <CardDescription>Customer reviews and success stories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testimonials-title">Section Title</Label>
                <Input
                  id="testimonials-title"
                  value={content.testimonials.title}
                  onChange={(e) => updateContent('testimonials', 'title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="testimonials-subtitle">Section Subtitle</Label>
                <Input
                  id="testimonials-subtitle"
                  value={content.testimonials.subtitle}
                  onChange={(e) => updateContent('testimonials', 'subtitle', e.target.value)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Customer Reviews</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('testimonials', 'reviews', { name: '', role: '', location: '', rating: 5, comment: '', avatar: '' })}
                    className="text-[#FF6B35] border-[#FF6B35] hover:bg-[#FF6B35]/10"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Review
                  </Button>
                </div>
                
                {content.testimonials.reviews.map((review, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[#1E3A8A]">Review {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('testimonials', 'reviews', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={review.name}
                            onChange={(e) => updateArrayItem('testimonials', 'reviews', index, { ...review, name: e.target.value })}
                            placeholder="Customer name"
                          />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Input
                            value={review.role}
                            onChange={(e) => updateArrayItem('testimonials', 'reviews', index, { ...review, role: e.target.value })}
                            placeholder="Job title"
                          />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={review.location}
                            onChange={(e) => updateArrayItem('testimonials', 'reviews', index, { ...review, location: e.target.value })}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label>Rating</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={review.rating}
                            onChange={(e) => updateArrayItem('testimonials', 'reviews', index, { ...review, rating: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Comment</Label>
                        <Textarea
                          value={review.comment}
                          onChange={(e) => updateArrayItem('testimonials', 'reviews', index, { ...review, comment: e.target.value })}
                          placeholder="Customer testimonial"
                          rows={3}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Section */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">About Section</CardTitle>
              <CardDescription>Company information and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="about-title">Section Title</Label>
                <Input
                  id="about-title"
                  value={content.about.title}
                  onChange={(e) => updateContent('about', 'title', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="about-description">Description</Label>
                <Textarea
                  id="about-description"
                  value={content.about.description}
                  onChange={(e) => updateContent('about', 'description', e.target.value)}
                  rows={3}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label>Company Statistics</Label>
                {content.about.stats.map((stat, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={stat.value}
                        onChange={(e) => updateArrayItem('about', 'stats', index, { ...stat, value: e.target.value })}
                        placeholder="₹500 Cr+"
                      />
                    </div>
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => updateArrayItem('about', 'stats', index, { ...stat, label: e.target.value })}
                        placeholder="Assets Under Management"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Section */}
        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Legal & Compliance</CardTitle>
              <CardDescription>Risk disclosure and regulatory information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="risk-title">Risk Disclosure Title</Label>
                <Input
                  id="risk-title"
                  value={content.riskDisclosure.title}
                  onChange={(e) => updateContent('riskDisclosure', 'title', e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                <Label>Risk Points</Label>
                {content.riskDisclosure.points.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={point}
                      onChange={(e) => updateArrayItem('riskDisclosure', 'points', index, e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('riskDisclosure', 'points', index)}
                      className="text-red-500 hover:text-red-700 self-start"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('riskDisclosure', 'points', '')}
                  className="text-[#FF6B35] border-[#FF6B35] hover:bg-[#FF6B35]/10"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Risk Point
                </Button>
              </div>
              
              <div>
                <Label htmlFor="registration-info">Registration Information</Label>
                <Textarea
                  id="registration-info"
                  value={content.riskDisclosure.registrationInfo}
                  onChange={(e) => updateContent('riskDisclosure', 'registrationInfo', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}