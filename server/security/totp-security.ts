/**
 * Enhanced TOTP Security Implementation
 * Implements industry best practices for TOTP authentication
 */

import { cryptoService } from './crypto';

interface TOTPSecurityEvent {
  adminId: string;
  ip: string;
  userAgent: string;
  action: 'generate' | 'verify' | 'backup_used' | 'disabled';
  success: boolean;
  timestamp: number;
}

class TOTPSecurityManager {
  private securityEvents: TOTPSecurityEvent[] = [];
  private maxEvents = 10000;
  private suspiciousAttemptThreshold = 5;
  private timeWindowMs = 15 * 60 * 1000; // 15 minutes

  /**
   * Log TOTP security event
   */
  logSecurityEvent(event: Omit<TOTPSecurityEvent, 'timestamp'>): void {
    const securityEvent: TOTPSecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.securityEvents.push(securityEvent);

    // Keep only recent events
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents = this.securityEvents.slice(-this.maxEvents);
    }

    // Check for suspicious activity
    this.checkSuspiciousActivity(event.adminId, event.ip);
  }

  /**
   * Check for suspicious TOTP activity
   */
  private checkSuspiciousActivity(adminId: string, ip: string): void {
    const now = Date.now();
    const recentEvents = this.securityEvents.filter(
      event => event.timestamp > now - this.timeWindowMs &&
               event.adminId === adminId &&
               event.ip === ip &&
               !event.success
    );

    if (recentEvents.length >= this.suspiciousAttemptThreshold) {
      console.warn(`⚠️  SECURITY ALERT: Multiple failed TOTP attempts for admin ${adminId.substring(0, 8)}... from IP ${ip}`);
      
      // In production, you might want to:
      // - Send email/SMS alerts
      // - Temporarily lock the account
      // - Increase rate limiting for this IP
      // - Log to security monitoring system
    }
  }

  /**
   * Get security events for an admin
   */
  getAdminSecurityEvents(adminId: string, limit = 50): TOTPSecurityEvent[] {
    return this.securityEvents
      .filter(event => event.adminId === adminId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    const now = Date.now();
    const last24Hours = this.securityEvents.filter(
      event => event.timestamp > now - 24 * 60 * 60 * 1000
    );

    const successfulAuth = last24Hours.filter(event => event.success).length;
    const failedAuth = last24Hours.filter(event => !event.success).length;
    const uniqueIPs = new Set(last24Hours.map(event => event.ip)).size;
    const uniqueAdmins = new Set(last24Hours.map(event => event.adminId)).size;

    return {
      last24Hours: {
        totalEvents: last24Hours.length,
        successfulAuth,
        failedAuth,
        successRate: last24Hours.length > 0 ? (successfulAuth / last24Hours.length) * 100 : 0,
        uniqueIPs,
        uniqueAdmins
      },
      allTime: {
        totalEvents: this.securityEvents.length,
        oldestEvent: this.securityEvents.length > 0 ? new Date(this.securityEvents[0].timestamp) : null
      }
    };
  }

  /**
   * Validate TOTP setup security
   */
  validateTOTPSetup(adminId: string, ip: string): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const recentSetups = this.securityEvents.filter(
      event => event.timestamp > now - this.timeWindowMs &&
               event.adminId === adminId &&
               event.action === 'generate'
    );

    // Limit TOTP setup attempts
    if (recentSetups.length >= 3) {
      return {
        allowed: false,
        reason: 'Too many TOTP setup attempts. Please wait before trying again.'
      };
    }

    return { allowed: true };
  }

  /**
   * Generate secure backup codes with validation
   */
  generateSecureBackupCodes(): string[] {
    const codes = cryptoService.generateBackupCodes(8);
    
    // Validate that codes are unique and meet security requirements
    const uniqueCodes = new Set(codes);
    if (uniqueCodes.size !== codes.length) {
      throw new Error('Duplicate backup codes generated');
    }

    return codes;
  }

  /**
   * Validate backup code format and security
   */
  validateBackupCode(code: string): { valid: boolean; reason?: string } {
    if (!code || typeof code !== 'string') {
      return { valid: false, reason: 'Invalid code format' };
    }

    const normalizedCode = code.replace(/\s+/g, '').toUpperCase();
    
    if (normalizedCode.length !== 8) {
      return { valid: false, reason: 'Code must be 8 characters' };
    }

    if (!/^[A-Z0-9]{8}$/.test(normalizedCode)) {
      return { valid: false, reason: 'Code must contain only letters and numbers' };
    }

    return { valid: true };
  }

  /**
   * Clear security events (for testing or maintenance)
   */
  clearSecurityEvents(): void {
    this.securityEvents = [];
  }
}

export const totpSecurityManager = new TOTPSecurityManager();

/**
 * TOTP Configuration Constants (following RFC 6238)
 */
export const TOTP_CONFIG = {
  // Time step in seconds (standard is 30 seconds)
  TIME_STEP: 30,
  
  // Window size for time drift tolerance (1 = 30 seconds on each side)
  WINDOW: 1,
  
  // Secret length in bytes (32 bytes = 256 bits for strong security)
  SECRET_LENGTH: 32,
  
  // Token length (6 digits is standard)
  TOKEN_LENGTH: 6,
  
  // Algorithm (SHA1 is standard for TOTP, but SHA256 is more secure)
  ALGORITHM: 'sha1',
  
  // Issuer name for authenticator apps
  ISSUER: 'fractOWN',
  
  // Maximum backup codes
  MAX_BACKUP_CODES: 8,
  
  // QR code settings
  QR_CODE: {
    errorCorrectionLevel: 'H' as const,
    type: 'image/png' as const,
    quality: 0.92,
    margin: 1,
    width: 256,
    height: 256
  }
};