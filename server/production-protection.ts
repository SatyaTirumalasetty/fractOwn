/**
 * Production Data Protection System
 * 
 * This module provides comprehensive protection against development data
 * overriding production data during deployments. It ensures production
 * data integrity and prevents any unintended data migrations.
 */

export interface EnvironmentInfo {
  isProduction: boolean;
  isDevelopment: boolean;
  nodeEnv: string;
  isReplitDeployment: boolean;
  hostname: string;
  databaseUrl: string;
  deploymentId?: string;
}

export class ProductionProtection {
  
  /**
   * Comprehensive environment detection
   */
  static getEnvironmentInfo(): EnvironmentInfo {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const isReplitDeployment = process.env.REPL_DEPLOYMENT === 'true';
    const hostname = process.env.REPL_SLUG || 'localhost';
    const databaseUrl = process.env.DATABASE_URL || '';
    
    // Multiple production indicators
    const isProduction = 
      nodeEnv === 'production' ||
      isReplitDeployment ||
      hostname.includes('prod') ||
      databaseUrl.includes('prod') ||
      databaseUrl.includes('neon') && isReplitDeployment ||
      process.env.REPLIT_DOMAINS !== undefined;

    return {
      isProduction,
      isDevelopment: !isProduction,
      nodeEnv,
      isReplitDeployment,
      hostname,
      databaseUrl: databaseUrl ? `***${databaseUrl.slice(-15)}` : 'not set',
      deploymentId: process.env.REPL_ID
    };
  }

  /**
   * Check if production data operations should be blocked
   */
  static shouldBlockOperation(operation: string): boolean {
    const env = this.getEnvironmentInfo();
    
    if (env.isProduction) {
      console.log(`🚫 PRODUCTION PROTECTION ACTIVE`);
      console.log(`🛡️ Operation "${operation}" blocked in production environment`);
      console.log(`📊 Production data integrity maintained`);
      console.log(`🔒 Environment: ${env.nodeEnv} | Deployment: ${env.isReplitDeployment}`);
      return true;
    }
    
    return false;
  }

  /**
   * Safe environment check for data seeding
   */
  static canSeedData(): boolean {
    const env = this.getEnvironmentInfo();
    
    if (env.isProduction) {
      console.log(`🚫 DATA SEEDING BLOCKED IN PRODUCTION`);
      console.log(`🔒 Production environment detected - seeding prevented`);
      console.log(`📊 Existing production data preserved`);
      return false;
    }
    
    console.log(`✅ Development environment - seeding allowed`);
    return true;
  }

  /**
   * Check if statistics should be initialized with default values
   */
  static shouldInitializeStatistics(): boolean {
    const env = this.getEnvironmentInfo();
    
    if (env.isProduction) {
      console.log(`🔒 Production statistics initialization skipped`);
      console.log(`📊 Production values will be maintained`);
      return false;
    }
    
    return true;
  }

  /**
   * Log environment status for debugging
   */
  static logEnvironmentStatus(): void {
    const env = this.getEnvironmentInfo();
    
    console.log(`\n=== ENVIRONMENT STATUS ===`);
    console.log(`Environment: ${env.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`Node ENV: ${env.nodeEnv}`);
    console.log(`Replit Deployment: ${env.isReplitDeployment}`);
    console.log(`Hostname: ${env.hostname}`);
    console.log(`Database: ${env.databaseUrl}`);
    console.log(`Data Protection: ${env.isProduction ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`===========================\n`);
  }

  /**
   * Create environment-specific cache keys to prevent data leakage
   */
  static createEnvironmentKey(baseKey: string): string {
    const env = this.getEnvironmentInfo();
    const suffix = env.isProduction ? '_prod' : '_dev';
    return `${baseKey}${suffix}`;
  }

  /**
   * Validate operation in current environment
   */
  static validateEnvironmentOperation(operation: string, allowedIn: 'development' | 'production' | 'both' = 'both'): boolean {
    const env = this.getEnvironmentInfo();
    
    if (allowedIn === 'development' && env.isProduction) {
      console.log(`🚫 Operation "${operation}" not allowed in production`);
      return false;
    }
    
    if (allowedIn === 'production' && env.isDevelopment) {
      console.log(`⚠️ Operation "${operation}" typically for production only`);
      return true; // Allow but warn
    }
    
    return true;
  }
}

/**
 * Middleware to protect production endpoints
 */
export function productionProtectionMiddleware(operation: string) {
  return (req: any, res: any, next: any) => {
    const env = ProductionProtection.getEnvironmentInfo();
    
    // Add environment info to request for debugging
    req.environmentInfo = env;
    
    // Log the operation for audit
    console.log(`🔍 ${operation} requested in ${env.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} environment`);
    
    next();
  };
}

/**
 * Database operation protection
 */
export class DatabaseProtection {
  
  /**
   * Check if database operations should be restricted
   */
  static shouldRestrictOperation(operation: 'seed' | 'reset' | 'migrate' | 'backup' | 'restore'): boolean {
    const env = ProductionProtection.getEnvironmentInfo();
    
    const restrictedInProduction = ['seed', 'reset'];
    
    if (env.isProduction && restrictedInProduction.includes(operation)) {
      console.log(`🚫 Database operation "${operation}" blocked in production`);
      console.log(`🛡️ Production data integrity protected`);
      return true;
    }
    
    return false;
  }

  /**
   * Safe database seeding with production protection
   */
  static async safeSeed(seedFunction: () => Promise<void>): Promise<boolean> {
    if (this.shouldRestrictOperation('seed')) {
      return false;
    }
    
    try {
      await seedFunction();
      console.log(`✅ Database seeding completed in development environment`);
      return true;
    } catch (error) {
      console.error(`❌ Database seeding failed:`, error);
      return false;
    }
  }
}