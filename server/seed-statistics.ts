import { db } from "./db";
import { sql } from "drizzle-orm";
import { ProductionProtection } from "./production-protection";

/**
 * Site Statistics Seeding with Production Protection
 * 
 * This module handles the initialization of site statistics with
 * comprehensive protection against overriding production data.
 */

const DEFAULT_SITE_STATISTICS = [
  // Platform Statistics
  {
    key: 'aum_value',
    value: '₹50 Cr+',
    label: 'Assets Under Management',
    category: 'statistics',
    format_type: 'currency'
  },
  {
    key: 'investors_count',
    value: '20+',
    label: 'Happy Investors',
    category: 'statistics',
    format_type: 'number'
  },
  {
    key: 'properties_count',
    value: '10+',
    label: 'Properties Listed',
    category: 'statistics',
    format_type: 'number'
  },
  {
    key: 'cities_count',
    value: '4',
    label: 'Cities Coverage',
    category: 'statistics',
    format_type: 'number'
  },
  
  // Investment Settings
  {
    key: 'min_investment',
    value: '₹10 Lakh',
    label: 'Minimum Investment',
    category: 'investment',
    format_type: 'currency'
  },
  
  // Content Values
  {
    key: 'entry_barrier',
    value: '₹10 Lakh',
    label: 'Entry Barrier Amount',
    category: 'content',
    format_type: 'currency'
  },
  {
    key: 'invest_step_amount',
    value: '₹10 Lakh',
    label: 'Investment Step Amount',
    category: 'content',
    format_type: 'currency'
  },
  {
    key: 'testimonial_amount',
    value: '₹10 Lakh',
    label: 'Testimonial Investment Amount',
    category: 'content',
    format_type: 'currency'
  }
];

/**
 * Check if statistics table exists and has data
 */
async function checkStatisticsTableStatus(): Promise<{exists: boolean, hasData: boolean, count: number}> {
  try {
    // Check if table exists and count records
    const result = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM site_statistics
    `);
    
    const rows = Array.isArray(result) ? result : (result.rows || []);
    const count = rows[0]?.count || 0;
    
    return {
      exists: true,
      hasData: count > 0,
      count: parseInt(count.toString())
    };
  } catch (error) {
    // Table might not exist
    return {
      exists: false,
      hasData: false,
      count: 0
    };
  }
}

/**
 * Safely seed site statistics with production protection
 */
export async function seedSiteStatistics(): Promise<{success: boolean, message: string, environment: string}> {
  const env = ProductionProtection.getEnvironmentInfo();
  
  // CRITICAL: Never override production data
  if (env.isProduction) {
    console.log("🔒 PRODUCTION STATISTICS PROTECTION ACTIVE");
    console.log("🛡️ Production statistics will not be overridden");
    console.log("📊 Existing production values preserved");
    return {
      success: false,
      message: "Statistics seeding blocked to protect production data",
      environment: "production"
    };
  }
  
  try {
    // Check current status
    const status = await checkStatisticsTableStatus();
    
    if (status.hasData) {
      console.log(`📊 Site statistics already exist (${status.count} records)`);
      console.log("✅ Development statistics preserved");
      return {
        success: true,
        message: `Existing statistics preserved (${status.count} records)`,
        environment: "development"
      };
    }
    
    // Create table if it doesn't exist
    if (!status.exists) {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS site_statistics (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT NOT NULL UNIQUE,
          value TEXT NOT NULL,
          label TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'statistics',
          format_type TEXT DEFAULT 'number',
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log("✅ Site statistics table created");
    }
    
    // Insert default statistics
    for (const stat of DEFAULT_SITE_STATISTICS) {
      await db.execute(sql`
        INSERT INTO site_statistics (key, value, label, category, format_type)
        VALUES (${stat.key}, ${stat.value}, ${stat.label}, ${stat.category}, ${stat.format_type})
        ON CONFLICT (key) DO NOTHING
      `);
    }
    
    console.log(`✅ Site statistics seeded with ${DEFAULT_SITE_STATISTICS.length} default values`);
    console.log("🔧 Statistics can be managed through admin dashboard");
    
    return {
      success: true,
      message: `Statistics initialized with ${DEFAULT_SITE_STATISTICS.length} default values`,
      environment: "development"
    };
    
  } catch (error) {
    console.error("❌ Failed to seed site statistics:", error);
    return {
      success: false,
      message: `Failed to seed statistics: ${error.message}`,
      environment: env.isProduction ? "production" : "development"
    };
  }
}

/**
 * Get current statistics status for debugging
 */
export async function getStatisticsStatus(): Promise<any> {
  try {
    const env = ProductionProtection.getEnvironmentInfo();
    const tableStatus = await checkStatisticsTableStatus();
    
    let sampleData = [];
    if (tableStatus.hasData) {
      const result = await db.execute(sql`
        SELECT key, value, category 
        FROM site_statistics 
        LIMIT 3
      `);
      sampleData = Array.isArray(result) ? result : (result.rows || []);
    }
    
    return {
      environment: env,
      table: tableStatus,
      sampleData,
      protection: {
        seedingBlocked: env.isProduction,
        dataProtected: env.isProduction
      }
    };
  } catch (error) {
    return {
      error: error.message,
      environment: ProductionProtection.getEnvironmentInfo()
    };
  }
}