/**
 * Client-side Environment Protection
 * 
 * This module provides client-side protection for environment-specific data
 * and ensures production data integrity from the frontend perspective.
 */

export interface EnvironmentInfo {
  isProduction: boolean;
  isDevelopment: boolean;
  hostname: string;
  deploymentIndicators: string[];
}

export class ClientEnvironmentProtection {
  
  /**
   * Detect environment based on client-side indicators
   */
  static getEnvironmentInfo(): EnvironmentInfo {
    const hostname = window.location.hostname;
    const isDomainProduction = 
      hostname.includes('replit.app') ||
      hostname.includes('fractown.in') ||
      hostname.includes('prod') ||
      !hostname.includes('localhost');
    
    const deploymentIndicators = [
      hostname.includes('replit.app') ? 'replit-deployment' : '',
      hostname.includes('fractown.in') ? 'custom-domain' : '',
      hostname.includes('prod') ? 'prod-hostname' : '',
      !hostname.includes('localhost') ? 'non-localhost' : ''
    ].filter(Boolean);
    
    const isProduction = isDomainProduction;
    
    return {
      isProduction,
      isDevelopment: !isProduction,
      hostname,
      deploymentIndicators
    };
  }

  /**
   * Create environment-specific storage keys
   */
  static createEnvironmentKey(baseKey: string): string {
    const env = this.getEnvironmentInfo();
    const suffix = env.isProduction ? '_prod' : '_dev';
    return `${baseKey}${suffix}`;
  }

  /**
   * Safe localStorage operations with environment isolation
   */
  static setItem(key: string, value: string): void {
    const envKey = this.createEnvironmentKey(key);
    try {
      localStorage.setItem(envKey, value);
      console.log(`💾 Stored data with environment key: ${envKey}`);
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }

  static getItem(key: string): string | null {
    const envKey = this.createEnvironmentKey(key);
    try {
      const value = localStorage.getItem(envKey);
      if (value) {
        console.log(`📖 Retrieved data with environment key: ${envKey}`);
      }
      return value;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    const envKey = this.createEnvironmentKey(key);
    try {
      localStorage.removeItem(envKey);
      console.log(`🗑️ Removed data with environment key: ${envKey}`);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  }

  /**
   * Log environment status for debugging
   */
  static logEnvironmentStatus(): void {
    const env = this.getEnvironmentInfo();
    
    console.log(`\n=== CLIENT ENVIRONMENT STATUS ===`);
    console.log(`Environment: ${env.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`Hostname: ${env.hostname}`);
    console.log(`Deployment Indicators: ${env.deploymentIndicators.join(', ') || 'none'}`);
    console.log(`Data Isolation: ${env.isProduction ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`================================\n`);
  }

  /**
   * Check if data migration should be prevented
   */
  static shouldPreventDataMigration(): boolean {
    const env = this.getEnvironmentInfo();
    
    if (env.isProduction) {
      console.log('🔒 Production environment detected - data migration prevented');
      return true;
    }
    
    return false;
  }

  /**
   * Safe data migration with environment protection
   */
  static migrateData(fromKey: string, toKey: string): boolean {
    if (this.shouldPreventDataMigration()) {
      console.log('🚫 Data migration blocked in production');
      return false;
    }
    
    try {
      const data = this.getItem(fromKey);
      if (data) {
        this.setItem(toKey, data);
        this.removeItem(fromKey);
        console.log(`✅ Data migrated from ${fromKey} to ${toKey}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to migrate data:', error);
      return false;
    }
  }

  /**
   * Get environment-specific custom field definitions
   */
  static getCustomFieldDefinitions(): any[] {
    try {
      const data = this.getItem('customFieldDefinitions');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse custom field definitions:', error);
      return [];
    }
  }

  /**
   * Set environment-specific custom field definitions
   */
  static setCustomFieldDefinitions(definitions: any[]): void {
    try {
      this.setItem('customFieldDefinitions', JSON.stringify(definitions));
    } catch (error) {
      console.error('Failed to store custom field definitions:', error);
    }
  }
}

/**
 * Hook for React components to use environment protection
 */
export function useEnvironmentProtection() {
  const environmentInfo = ClientEnvironmentProtection.getEnvironmentInfo();
  
  return {
    environmentInfo,
    isProduction: environmentInfo.isProduction,
    isDevelopment: environmentInfo.isDevelopment,
    createEnvironmentKey: ClientEnvironmentProtection.createEnvironmentKey,
    setItem: ClientEnvironmentProtection.setItem,
    getItem: ClientEnvironmentProtection.getItem,
    removeItem: ClientEnvironmentProtection.removeItem,
    getCustomFieldDefinitions: ClientEnvironmentProtection.getCustomFieldDefinitions,
    setCustomFieldDefinitions: ClientEnvironmentProtection.setCustomFieldDefinitions,
    logEnvironmentStatus: ClientEnvironmentProtection.logEnvironmentStatus
  };
}