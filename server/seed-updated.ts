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
    totalValue: 25000000,
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
    totalValue: 52000000,
    minInvestment: 50000,
    expectedReturn: "13.50",
    fundingProgress: 45,
    imageUrls: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "commercial",
    isActive: true,
  },
  {
    name: "Emerald Gardens",
    description: "Luxury villa community in Baner with club house and recreational facilities",
    location: "Baner",
    city: "Pune",
    state: "Maharashtra",
    totalValue: 38000000,
    minInvestment: 38000,
    expectedReturn: "10.80",
    fundingProgress: 95,
    imageUrls: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "residential",
    isActive: true,
  }
];

async function seedDatabase() {
  // CRITICAL: Prevent accidental seeding in production
  if (process.env.NODE_ENV === 'production') {
    console.log("🚫 PRODUCTION ENVIRONMENT DETECTED");
    console.log("📋 Seeding is disabled in production to prevent data corruption");
    console.log("💾 Production will load existing data from the database");
    console.log("✅ Production data isolation maintained");
    return;
  }
  try {
    console.log("Clearing existing data...");
    await db.delete(properties);
    await db.delete(adminUsers);
    
    console.log("Seeding database...");
    
    // Add sample properties
    await db.insert(properties).values(sampleProperties);
    console.log("✓ Properties seeded");
    
    // Only create admin user if explicitly provided in environment
    if (process.env.ADMIN_INITIAL_PASSWORD) {
      const passwordHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD, 12);
      await db.insert(adminUsers).values({
        username: process.env.ADMIN_USERNAME || "admin",
        email: process.env.ADMIN_EMAIL || "admin@fractown.com",
        passwordHash,
        role: "admin"
      });
      console.log("✓ Admin user created from environment variables");
    } else {
      console.log("⚠️  No admin user created. Set ADMIN_INITIAL_PASSWORD environment variable to create admin user.");
    }
    
    console.log("🔐 SECURITY: All user data stored in database. No hardcoded credentials.")
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();