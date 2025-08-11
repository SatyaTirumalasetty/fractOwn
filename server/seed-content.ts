import { db } from "./db";
import { contentSections } from "@shared/schema";
import { eq } from "drizzle-orm";

const defaultContentData = [
  // Footer Risk Disclosure
  {
    key: "footer_risk_disclosure_title",
    title: "Investment Risk Disclosure",
    content: "Investment Risk Disclosure",
    contentType: "text",
    section: "risk_disclosure",
    displayOrder: 1,
    metadata: {}
  },
  {
    key: "footer_risk_disclosure_content",
    title: "Risk Disclosure Content",
    content: "Real estate investments are subject to market risks including fluctuations in property values, interest rates, and economic conditions. Past performance does not guarantee future results. Please read all investment documents carefully and consult with financial advisors before investing.",
    contentType: "text",
    section: "risk_disclosure",
    displayOrder: 2,
    metadata: {}
  },
  {
    key: "footer_sebi_compliance",
    title: "SEBI Compliance Notice",
    content: "fractOWN is registered with SEBI as an Alternative Investment Fund (AIF) - Registration No: AIF/XXX/XXXX.",
    contentType: "text",
    section: "risk_disclosure",
    displayOrder: 3,
    metadata: {}
  },

  // How It Works Steps
  {
    key: "how_it_works_step1_title",
    title: "Browse Properties",
    content: "Browse Properties",
    contentType: "text",
    section: "how_it_works",
    displayOrder: 1,
    metadata: { icon: "search", color: "blue" }
  },
  {
    key: "how_it_works_step1_description",
    title: "Browse Properties Description",
    content: "Explore vetted properties across major Indian cities with detailed financials and projections",
    contentType: "text",
    section: "how_it_works",
    displayOrder: 2,
    metadata: { parent: "step1" }
  },
  {
    key: "how_it_works_step2_title",
    title: "Calculate Returns",
    content: "Calculate Returns",
    contentType: "text",
    section: "how_it_works",
    displayOrder: 3,
    metadata: { icon: "calculator", color: "green" }
  },
  {
    key: "how_it_works_step2_description",
    title: "Calculate Returns Description",
    content: "Use our investment calculator to determine your share size and expected returns",
    contentType: "text",
    section: "how_it_works",
    displayOrder: 4,
    metadata: { parent: "step2" }
  },
  {
    key: "how_it_works_step3_title",
    title: "Invest Securely",
    content: "Invest Securely",
    contentType: "text",
    section: "how_it_works",
    displayOrder: 5,
    metadata: { icon: "shield", color: "orange" }
  },
  {
    key: "how_it_works_step3_description",
    title: "Invest Securely Description",
    content: "Complete KYC verification and invest with secure payment methods starting from ₹5,000",
    contentType: "text",
    section: "how_it_works",
    displayOrder: 6,
    metadata: { parent: "step3" }
  },
  {
    key: "how_it_works_step4_title",
    title: "Earn Returns",
    content: "Earn Returns",
    contentType: "text",
    section: "how_it_works",
    displayOrder: 7,
    metadata: { icon: "trending-up", color: "purple" }
  },
  {
    key: "how_it_works_step4_description",
    title: "Earn Returns Description",
    content: "Benefit from property appreciation and market growth over time",
    contentType: "text",
    section: "how_it_works",
    displayOrder: 8,
    metadata: { parent: "step4" }
  },

  // Footer Content
  {
    key: "footer_company_description",
    title: "Company Description",
    content: "fractOWN democratizes real estate investment through fractional ownership, making premium properties accessible to every investor.",
    contentType: "text",
    section: "footer",
    displayOrder: 1,
    metadata: {}
  },
  {
    key: "footer_contact_email",
    title: "Contact Email",
    content: "support@fractown.in",
    contentType: "text",
    section: "footer",
    displayOrder: 2,
    metadata: { type: "email" }
  },
  {
    key: "footer_contact_phone",
    title: "Contact Phone",
    content: "+91 98765 43210",
    contentType: "text",
    section: "footer",
    displayOrder: 3,
    metadata: { type: "phone" }
  },
  {
    key: "footer_address",
    title: "Office Address",
    content: "123 Business Park, Sector 18, Gurugram, Haryana 122015",
    contentType: "text",
    section: "footer",
    displayOrder: 4,
    metadata: { type: "address" }
  }
];

export async function seedContentSections() {
  console.log("🌱 Seeding content sections...");
  
  try {
    for (const contentData of defaultContentData) {
      // Check if content section already exists
      const existing = await db.select()
        .from(contentSections)
        .where(eq(contentSections.key, contentData.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(contentSections).values({
          ...contentData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Created content section: ${contentData.key}`);
      } else {
        console.log(`⏭️  Content section already exists: ${contentData.key}`);
      }
    }

    console.log("🎉 Content sections seeding completed!");
    return { success: true, message: "Content sections seeded successfully" };
  } catch (error) {
    console.error("❌ Error seeding content sections:", error);
    return { success: false, message: "Failed to seed content sections", error };
  }
}

// Function to update existing content sections (for migrations)
export async function updateContentSections() {
  console.log("🔄 Updating content sections...");
  
  try {
    // Remove SEBI Compliance section as requested
    await db.delete(contentSections)
      .where(eq(contentSections.key, "footer_sebi_compliance"));
    
    console.log("🗑️ Removed SEBI Compliance section");
    
    console.log("✅ Content sections updated successfully!");
    return { success: true, message: "Content sections updated successfully" };
  } catch (error) {
    console.error("❌ Error updating content sections:", error);
    return { success: false, message: "Failed to update content sections", error };
  }
}