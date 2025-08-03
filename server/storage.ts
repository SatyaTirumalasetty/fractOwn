import { type Property, type InsertProperty, type Contact, type InsertContact } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Properties
  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  
  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
}

export class MemStorage implements IStorage {
  private properties: Map<string, Property>;
  private contacts: Map<string, Contact>;

  constructor() {
    this.properties = new Map();
    this.contacts = new Map();
    
    // Initialize with sample properties
    this.initializeProperties();
  }

  private initializeProperties() {
    const sampleProperties: Property[] = [
      {
        id: "1",
        name: "Oberoi Sky Heights",
        description: "Premium 3BHK apartments in Goregaon with world-class amenities",
        location: "Goregaon",
        city: "Mumbai",
        state: "Maharashtra",
        totalValue: 25000000, // ₹2.5 Cr
        minInvestment: 25000,
        expectedReturn: "11.20",

        fundingProgress: 72,
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        propertyType: "residential",
        isActive: true,
      },
      {
        id: "2",
        name: "Tech Park Plaza",
        description: "Grade A commercial office space in Electronic City with IT giants as tenants",
        location: "Electronic City",
        city: "Bangalore",
        state: "Karnataka",
        totalValue: 52000000, // ₹5.2 Cr
        minInvestment: 50000,
        expectedReturn: "13.50",

        fundingProgress: 45,
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        propertyType: "commercial",
        isActive: true,
      },
      {
        id: "3",
        name: "Emerald Gardens",
        description: "Luxury villa community in Baner with club house and recreational facilities",
        location: "Baner",
        city: "Pune",
        state: "Maharashtra",
        totalValue: 38000000, // ₹3.8 Cr
        minInvestment: 38000,
        expectedReturn: "10.80",

        fundingProgress: 95,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        propertyType: "residential",
        isActive: true,
      },
      {
        id: "4",
        name: "Marina Bay Towers",
        description: "Luxury waterfront apartments with sea views and premium amenities",
        location: "Marine Drive",
        city: "Mumbai",
        state: "Maharashtra",
        totalValue: 45000000, // ₹4.5 Cr
        minInvestment: 45000,
        expectedReturn: "12.50",

        fundingProgress: 28,
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        propertyType: "residential",
        isActive: true,
      },
      {
        id: "5",
        name: "Business Central Hub",
        description: "Prime commercial space in Cyber City with multinational tenants",
        location: "Cyber City",
        city: "Gurgaon",
        state: "Haryana",
        totalValue: 68000000, // ₹6.8 Cr
        minInvestment: 68000,
        expectedReturn: "14.20",

        fundingProgress: 63,
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        propertyType: "commercial",
        isActive: true,
      },
      {
        id: "6",
        name: "Green Valley Residences",
        description: "Eco-friendly apartments with solar panels and rainwater harvesting",
        location: "Whitefield",
        city: "Bangalore",
        state: "Karnataka",
        totalValue: 32000000, // ₹3.2 Cr
        minInvestment: 32000,
        expectedReturn: "10.50",

        fundingProgress: 55,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        propertyType: "residential",
        isActive: true,
      }
    ];

    sampleProperties.forEach(property => {
      this.properties.set(property.id, property);
    });
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.isActive);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = { 
      ...insertProperty, 
      id,
      fundingProgress: insertProperty.fundingProgress ?? 0,
      isActive: insertProperty.isActive ?? true
    };
    this.properties.set(id, property);
    return property;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = { 
      ...insertContact, 
      id,
      createdAt: new Date().toISOString()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
}

export const storage = new MemStorage();
