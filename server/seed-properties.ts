import { db } from "./db";
import { properties } from "@shared/schema";

const sampleProperties = [
  // Chennai Properties
  {
    name: "Prestige Sunrise Park",
    description: "Premium residential complex in OMR with world-class amenities including swimming pool, gym, and landscaped gardens. Located in the heart of IT corridor with excellent connectivity.",
    location: "OMR, Sholinganallur",
    city: "Chennai",
    state: "Tamil Nadu",
    totalValue: 50000000, // 5 crores
    minInvestment: 1000000, // 10 lakhs
    expectedReturn: "12.5",
    fundingProgress: 65,
    imageUrls: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&h=600&fit=crop&auto=format"
    ],
    propertyType: "residential"
  },
  {
    name: "Brigade Gateway",
    description: "Mixed-use development featuring premium offices and retail spaces in Rajaji Nagar. This project offers excellent rental yields and capital appreciation potential.",
    location: "Rajaji Nagar",
    city: "Chennai", 
    state: "Tamil Nadu",
    totalValue: 75000000, // 7.5 crores
    minInvestment: 1500000, // 15 lakhs
    expectedReturn: "14.2",
    fundingProgress: 43,
    imageUrls: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop&auto=format"
    ],
    propertyType: "commercial"
  },
  {
    name: "Phoenix MarketCity Extension",
    description: "Premium retail and office space in Velachery with high footfall and established tenant base. Perfect for investors seeking steady rental income.",
    location: "Velachery",
    city: "Chennai",
    state: "Tamil Nadu", 
    totalValue: 120000000, // 12 crores
    minInvestment: 2000000, // 20 lakhs
    expectedReturn: "11.8",
    fundingProgress: 78,
    imageUrls: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1554034483-04fda0d3507b?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&auto=format"
    ],
    propertyType: "commercial"
  },

  // Hyderabad Properties
  {
    name: "Salarpuria Sattva Greenage",
    description: "Luxury residential towers in Kondapur with premium amenities including club house, swimming pool, and children's play area. Located in prime IT hub area.",
    location: "Kondapur",
    city: "Hyderabad",
    state: "Telangana",
    totalValue: 60000000, // 6 crores
    minInvestment: 1200000, // 12 lakhs
    expectedReturn: "13.5",
    fundingProgress: 52,
    imageUrls: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop&auto=format"
    ],
    propertyType: "residential"
  },
  {
    name: "Mindspace HITEC City",
    description: "Premium office complex in HITEC City with multinational tenants and excellent infrastructure. High rental yields with established corporate presence.",
    location: "HITEC City",
    city: "Hyderabad",
    state: "Telangana",
    totalValue: 95000000, // 9.5 crores
    minInvestment: 1800000, // 18 lakhs
    expectedReturn: "15.2",
    fundingProgress: 71,
    imageUrls: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop&auto=format"
    ],
    propertyType: "commercial"
  },
  {
    name: "Forum Sujana Mall Expansion",
    description: "Retail and entertainment complex expansion in Kukatpally with anchor tenants and food court. Prime location with high visibility and footfall.",
    location: "Kukatpally",
    city: "Hyderabad",
    state: "Telangana",
    totalValue: 80000000, // 8 crores
    minInvestment: 1600000, // 16 lakhs
    expectedReturn: "12.8",
    fundingProgress: 34,
    imageUrls: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1567226475328-9d6baaf565cf?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&auto=format"
    ],
    propertyType: "commercial"
  },

  // Coimbatore Properties
  {
    name: "Sobha City",
    description: "Integrated residential township in Saravanampatty with villas and apartments. Features landscaped gardens, sports facilities, and proximity to educational institutions.",
    location: "Saravanampatty",
    city: "Coimbatore",
    state: "Tamil Nadu",
    totalValue: 45000000, // 4.5 crores
    minInvestment: 1000000, // 10 lakhs
    expectedReturn: "11.5",
    fundingProgress: 58,
    imageUrls: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600607688960-e095ab2c72c2?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600607688608-8b05a9623b71?w=800&h=600&fit=crop&auto=format"
    ],
    propertyType: "residential"
  },
  {
    name: "Brookfields Mall Phase 2",
    description: "Retail and multiplex development in RS Puram with established brand presence. Strategic location with excellent connectivity and parking facilities.",
    location: "RS Puram",
    city: "Coimbatore",
    state: "Tamil Nadu",
    totalValue: 65000000, // 6.5 crores
    minInvestment: 1300000, // 13 lakhs
    expectedReturn: "13.2",
    fundingProgress: 45,
    imageUrls: [
      "https://images.unsplash.com/photo-1567226475328-9d6baaf565cf?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1563612078-7ee0b5ff1c65?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1555448248-2571daf6344b?w=800&h=600&fit=crop&auto=format"
    ],
    propertyType: "commercial"
  },
  {
    name: "Avinashi Road IT Park",
    description: "Modern office complex on Avinashi Road with IT companies and service centers. Growing IT hub with excellent infrastructure and amenities.",
    location: "Avinashi Road",
    city: "Coimbatore",
    state: "Tamil Nadu",
    totalValue: 55000000, // 5.5 crores
    minInvestment: 1100000, // 11 lakhs
    expectedReturn: "14.5",
    fundingProgress: 67,
    imageUrls: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&h=600&fit=crop&auto=format"
    ],
    propertyType: "commercial"
  }
];

export async function seedProperties() {
  try {
    console.log("Seeding properties...");
    
    // Clear existing properties
    await db.delete(properties);
    
    // Insert sample properties
    await db.insert(properties).values(sampleProperties);
    
    console.log(`Seeded ${sampleProperties.length} properties successfully`);
  } catch (error) {
    console.error("Error seeding properties:", error);
    throw error;
  }
}

// Export sample data for reference
export { sampleProperties };