import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  title: string;
  location: string;
  content: string;
  rating: number;
  avatar?: string;
}

export default function TestimonialsSection() {
  const { data: contentData } = useQuery<any[]>({
    queryKey: ['/api/content'],
  });

  const getTestimonials = (): Testimonial[] => {
    if (!contentData || !Array.isArray(contentData)) return getDefaultTestimonials();
    
    const testimonialsContent = contentData.find((item: any) => item.key === 'testimonials_content');
    if (testimonialsContent && testimonialsContent.content) {
      try {
        return JSON.parse(testimonialsContent.content);
      } catch {
        return getDefaultTestimonials();
      }
    }
    return getDefaultTestimonials();
  };

  const getDefaultTestimonials = (): Testimonial[] => {
    return [
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
    ];
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const testimonials = getTestimonials();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Investors Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from successful fractional property investors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              {renderStars(testimonial.rating)}
              
              <p className="text-gray-600 mb-4 italic leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">
                    {testimonial.title}, {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}