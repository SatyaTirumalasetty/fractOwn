import { db } from "./db";
import { properties, adminUsers } from "@shared/schema";
import bcrypt from "bcrypt";

const sampleProperties = [
  {
    name: "Oberoi Sky Heights",
    description: "Premium 3BHK apartments in Goregaon with world-class amenities",
    location: "Goregaon",
    city: "Mumbai",
    state: "Maharashtra",
    totalValue: 25000000, // ₹2.5 Cr
    minInvestment: 25000,
    expectedReturn: "11.20",
    fundingProgress: 72,
    imageUrls: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "residential",
    isActive: true,
  },
  {
    name: "Tech Park Plaza",
    description: "Grade A commercial office space in Electronic City with IT giants as tenants",
    location: "Electronic City",
    city: "Bangalore",
    state: "Karnataka",
    totalValue: 52000000, // ₹5.2 Cr
    minInvestment: 50000,
    expectedReturn: "13.50",
    fundingProgress: 45,
    imageUrls: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "commercial",
    isActive: true,
  },
  {
    name: "Emerald Gardens",
    description: "Luxury villa community in Baner with club house and recreational facilities",
    location: "Baner",
    city: "Pune",
    state: "Maharashtra",
    totalValue: 38000000, // ₹3.8 Cr
    minInvestment: 38000,
    expectedReturn: "10.80",
    fundingProgress: 95,
    imageUrls: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "residential",
    isActive: true,
  },
  {
    name: "Marina Bay Towers",
    description: "Luxury waterfront apartments with sea views and premium amenities",
    location: "Marine Drive",
    city: "Mumbai",
    state: "Maharashtra",
    totalValue: 45000000, // ₹4.5 Cr
    minInvestment: 45000,
    expectedReturn: "12.50",
    fundingProgress: 28,
    imageUrls: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "residential",
    isActive: true,
  },
  {
    name: "Business Central Hub",
    description: "Prime commercial space in Cyber City with multinational tenants",
    location: "Cyber City",
    city: "Gurgaon",
    state: "Haryana",
    totalValue: 68000000, // ₹6.8 Cr
    minInvestment: 68000,
    expectedReturn: "14.20",
    fundingProgress: 63,
    imageUrls: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "commercial",
    isActive: true,
  },
  {
    name: "Green Valley Residences",
    description: "Eco-friendly apartments with solar panels and rainwater harvesting",
    location: "Whitefield",
    city: "Bangalore",
    state: "Karnataka",
    totalValue: 32000000, // ₹3.2 Cr
    minInvestment: 32000,
    expectedReturn: "10.50",
    fundingProgress: 55,
    imageUrls: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "residential",
    isActive: true,
  }
];

async function seedDatabase() {
  try {
    console.log("Seeding database...");
    
    // Add sample properties
    await db.insert(properties).values(sampleProperties);
    console.log("✓ Properties seeded");
    
    // Add default admin user with secure password
    // Use environment variable or generate secure random password
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || require('crypto').randomBytes(12).toString('hex');
    const passwordHash = await bcrypt.hash(initialPassword, 12);
    await db.insert(adminUsers).values({
      username: "admin",
      email: "admin@fractown.com",
      passwordHash,
      role: "admin"
    });
    
    console.log("✓ Admin user created");
    console.log("🔐 SECURITY: Change admin password immediately after first login");
    if (!process.env.ADMIN_INITIAL_PASSWORD) {
      console.log(`📝 Generated password: ${initialPassword}`);
      console.log("⚠️  This password will only be shown once - save it securely");
    }
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();