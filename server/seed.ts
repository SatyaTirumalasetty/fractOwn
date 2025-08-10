import { db } from "./db";
import { properties, adminUsers } from "@shared/schema";
import bcrypt from "bcrypt";

// Production Data Protection - Prevent dev data migration
const PRODUCTION_ENVIRONMENT_CHECK = {
  isProduction: () => {
    return process.env.NODE_ENV === 'production' || 
           process.env.REPL_DEPLOYMENT === 'true' ||
           process.env.DATABASE_URL?.includes('prod') ||
           process.env.REPL_OWNER?.includes('prod');
  },
  
  shouldPreventSeeding: () => {
    const isProd = PRODUCTION_ENVIRONMENT_CHECK.isProduction();
    if (isProd) {
      console.log("🚫 PRODUCTION ENVIRONMENT DETECTED");
      console.log("🛡️ Development data seeding is BLOCKED to protect production");
      console.log("📊 Production data remains isolated and unaffected");
      return true;
    }
    return false;
  },
  
  getEnvironmentInfo: () => {
    return {
      nodeEnv: process.env.NODE_ENV,
      isReplitDeployment: process.env.REPL_DEPLOYMENT,
      databaseUrl: process.env.DATABASE_URL ? '***' + process.env.DATABASE_URL.slice(-10) : 'not set',
      replOwner: process.env.REPL_OWNER || 'not set'
    };
  }
};

const sampleProperties = [
  {
    name: "Marina Bay Residences",
    description: "Luxury waterfront apartments with sea views and premium amenities near Marina Beach",
    location: "Marina Beach Road",
    city: "Chennai",
    state: "Tamil Nadu",
    totalValue: 45000000, // ₹4.5 Cr
    minInvestment: 45000,
    expectedReturn: "12.50",
    fundingProgress: 68,
    imageUrls: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "residential",
    isActive: true,
  },
  {
    name: "IT Park Central",
    description: "Grade A commercial office space in OMR with tech giants as tenants",
    location: "Old Mahabalipuram Road",
    city: "Chennai",
    state: "Tamil Nadu",
    totalValue: 52000000, // ₹5.2 Cr
    minInvestment: 50000,
    expectedReturn: "13.80",
    fundingProgress: 42,
    imageUrls: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "commercial",
    isActive: true,
  },
  {
    name: "Emerald Heights",
    description: "Premium residential towers with modern amenities in heart of Chennai",
    location: "T. Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    totalValue: 38000000, // ₹3.8 Cr
    minInvestment: 38000,
    expectedReturn: "11.20",
    fundingProgress: 85,
    imageUrls: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "residential",
    isActive: true,
  },
  {
    name: "Tech Valley Plaza",
    description: "Modern commercial complex in HITEC City with multinational companies",
    location: "HITEC City",
    city: "Hyderabad",
    state: "Telangana",
    totalValue: 60000000, // ₹6.0 Cr
    minInvestment: 60000,
    expectedReturn: "14.20",
    fundingProgress: 55,
    imageUrls: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "commercial",
    isActive: true,
  },
  {
    name: "Cyber Towers",
    description: "Premium residential apartments in Gachibowli with world-class facilities",
    location: "Gachibowli",
    city: "Hyderabad",
    state: "Telangana",
    totalValue: 42000000, // ₹4.2 Cr
    minInvestment: 42000,
    expectedReturn: "12.80",
    fundingProgress: 73,
    imageUrls: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "residential",
    isActive: true,
  },
  {
    name: "Mill Heritage Residences",
    description: "Luxury villa community near textile mills with traditional and modern architecture",
    location: "Peelamedu",
    city: "Coimbatore",
    state: "Tamil Nadu",
    totalValue: 35000000, // ₹3.5 Cr
    minInvestment: 35000,
    expectedReturn: "11.50",
    fundingProgress: 62,
    imageUrls: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "residential",
    isActive: true,
  },
  {
    name: "Business Park Coimbatore",
    description: "Commercial office spaces with IT and manufacturing companies as tenants",
    location: "Saravanampatti",
    city: "Coimbatore",
    state: "Tamil Nadu",
    totalValue: 28000000, // ₹2.8 Cr
    minInvestment: 28000,
    expectedReturn: "13.20",
    fundingProgress: 48,
    imageUrls: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
    propertyType: "commercial",
    isActive: true,
  }
];

async function seedDatabase() {
  try {
    // CRITICAL: Check production environment first
    if (PRODUCTION_ENVIRONMENT_CHECK.shouldPreventSeeding()) {
      console.log("Environment info:", PRODUCTION_ENVIRONMENT_CHECK.getEnvironmentInfo());
      return {
        success: false,
        message: "Seeding blocked to protect production data",
        environment: "production"
      };
    }

    console.log("🌱 Seeding database with development data...");
    console.log("Environment:", PRODUCTION_ENVIRONMENT_CHECK.getEnvironmentInfo());
    
    // Add sample properties
    await db.insert(properties).values(sampleProperties);
    console.log("✓ Properties seeded");
    
    // Only create admin user if ADMIN_INITIAL_PASSWORD is provided
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
    
    console.log("🔐 SECURITY: All user data is stored in database. No hardcoded credentials.")
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();