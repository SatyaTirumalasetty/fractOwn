import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Plus, Trash2, MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface Testimonial {
  id: string;
  name: string;
  title: string;
  location: string;
  content: string;
  rating: number;
  avatar?: string;
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Fetch existing testimonials content
  const { data: contentData } = useQuery<any[]>({
    queryKey: ['/api/content'],
  });

  useEffect(() => {
    if (contentData && Array.isArray(contentData)) {
      const testimonialsContent = contentData.find((item: any) => item.key === 'testimonials_content');
      if (testimonialsContent && testimonialsContent.content) {
        try {
          const parsed = JSON.parse(testimonialsContent.content);
          setTestimonials(parsed);
        } catch {
          // If parsing fails, set default testimonials
          setDefaultTestimonials();
        }
      } else {
        setDefaultTestimonials();
      }
    }
  }, [contentData]);

  const setDefaultTestimonials = () => {
    setTestimonials([
      {
        id: "1",
        name: "Priya Sharma",
        title: "Software Engineer",
        location: "Bangalore",
        content: "I started with just ₹25,000 and my investment has grown significantly. fractOWN made real estate investment so accessible for someone like me.",
        rating: 5,
      },
      {
        id: "2",
        name: "Rajesh Kumar",
        title: "Marketing Manager",
        location: "Mumbai",
        content: "The transparency and professional management is outstanding. I can track my investments and returns in real-time. Already planning my next investment!",
        rating: 5,
      },
      {
        id: "3",
        name: "Anjali Patel",
        title: "Financial Advisor",
        location: "Pune",
        content: "Diversifying across 5 properties has given me excellent returns and portfolio growth. Much better than my fixed deposits!",
        rating: 5,
      }
    ]);
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: string | number) => {
    setTestimonials(prev => prev.map(testimonial => 
      testimonial.id === id ? { ...testimonial, [field]: value } : testimonial
    ));
  };

  const addTestimonial = () => {
    const newId = Date.now().toString();
    setTestimonials(prev => [...prev, {
      id: newId,
      name: "",
      title: "",
      location: "",
      content: "",
      rating: 5,
    }]);
  };

  const removeTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
  };

  const handleSave = async () => {
    const incompleteTestimonials = testimonials.filter(t => 
      !t.name.trim() || !t.title.trim() || !t.location.trim() || !t.content.trim()
    );

    if (incompleteTestimonials.length > 0) {
      toast({
        title: "Validation Error",
        description: "All testimonials must have name, title, location, and content filled.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiRequest('/api/admin/content/key/testimonials_content', 'PUT', { content: JSON.stringify(testimonials) });

      queryClient.invalidateQueries({ queryKey: ['/api/content'] });

      toast({
        title: "Testimonials Updated",
        description: "Customer testimonials have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save testimonials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${onChange ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Testimonials Manager</span>
        </CardTitle>
        <CardDescription>
          Manage customer testimonials displayed in the "What Our Investors Say" section.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Testimonial #{index + 1}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTestimonial(testimonial.id)}
                    disabled={testimonials.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`name-${testimonial.id}`}>Customer Name</Label>
                    <Input
                      id={`name-${testimonial.id}`}
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                      placeholder="e.g., Priya Sharma"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`title-${testimonial.id}`}>Job Title</Label>
                    <Input
                      id={`title-${testimonial.id}`}
                      value={testimonial.title}
                      onChange={(e) => updateTestimonial(testimonial.id, 'title', e.target.value)}
                      placeholder="e.g., Software Engineer"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`location-${testimonial.id}`}>Location</Label>
                    <Input
                      id={`location-${testimonial.id}`}
                      value={testimonial.location}
                      onChange={(e) => updateTestimonial(testimonial.id, 'location', e.target.value)}
                      placeholder="e.g., Bangalore"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`content-${testimonial.id}`}>Testimonial Content</Label>
                  <Textarea
                    id={`content-${testimonial.id}`}
                    value={testimonial.content}
                    onChange={(e) => updateTestimonial(testimonial.id, 'content', e.target.value)}
                    placeholder="Customer's testimonial about their investment experience..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Rating</Label>
                  <div className="mt-1">
                    {renderStars(testimonial.rating, (rating) => 
                      updateTestimonial(testimonial.id, 'rating', rating)
                    )}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Preview:</h5>
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.title}, {testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={addTestimonial}>
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Testimonials"}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Best Practices:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keep testimonials authentic and specific</li>
            <li>• Include investment amounts when possible (₹25,000, etc.)</li>
            <li>• Mention specific benefits (returns, accessibility, transparency)</li>
            <li>• Use diverse customer profiles (different locations, professions)</li>
            <li>• Aim for 3-6 testimonials for optimal display</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}