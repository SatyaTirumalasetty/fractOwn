import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Enhanced input validation and sanitization
 * Protects against XSS, injection attacks, and data corruption
 */

export class SecurityValidator {
  
  /**
   * Validate TOTP token format and structure
   */
  static validateTOTPToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // TOTP tokens are exactly 6 digits
    const totpRegex = /^[0-9]{6}$/;
    return totpRegex.test(token);
  }

  /**
   * Validate backup code format
   */
  static validateBackupCode(code: string): boolean {
    if (!code || typeof code !== 'string') return false;
    
    // Backup codes are 8 character alphanumeric
    const backupCodeRegex = /^[A-Z0-9]{8}$/;
    return backupCodeRegex.test(code.toUpperCase());
  }

  /**
   * Validate admin username
   */
  static validateAdminUsername(username: string): boolean {
    if (!username || typeof username !== 'string') return false;
    
    // Admin usernames: 3-50 characters, alphanumeric, dots, underscores, hyphens
    const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;
    return usernameRegex.test(username);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return { valid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    const commonPatterns = [
      /(.)\1{3,}/, // Same character repeated 4+ times
      /123456|abcdef|qwerty|password|admin/i, // Common sequences
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns');
        break;
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate phone number (Indian format)
   */
  static validatePhoneNumber(phone: string, countryCode: string = '+91'): boolean {
    if (!phone || typeof phone !== 'string') return false;
    
    const cleanPhone = phone.replace(/\s+/g, '');
    
    if (countryCode === '+91') {
      // Indian mobile numbers: 10 digits starting with 6-9
      const indianMobileRegex = /^[6-9]\d{9}$/;
      return indianMobileRegex.test(cleanPhone);
    }
    
    // Generic international format validation
    const internationalRegex = /^\+?[1-9]\d{1,14}$/;
    return internationalRegex.test(cleanPhone);
  }

  /**
   * Sanitize input to prevent XSS attacks
   */
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Remove potential script injections
      return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (input && typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Validate session token format
   */
  static validateSessionToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // Session tokens should be 64 character hex strings
    const sessionTokenRegex = /^[a-f0-9]{64}$/;
    return sessionTokenRegex.test(token);
  }

  /**
   * Middleware for request validation and sanitization
   */
  static createValidationMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Sanitize request body
      if (req.body) {
        req.body = SecurityValidator.sanitizeInput(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = SecurityValidator.sanitizeInput(req.query);
      }

      // Validate Content-Type for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.get('Content-Type') || '';
        if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
          return res.status(400).json({ 
            error: 'Invalid content type',
            message: 'Only JSON and multipart/form-data are supported'
          });
        }
      }

      // Check for oversized requests
      const contentLength = parseInt(req.get('Content-Length') || '0');
      if (contentLength > 10 * 1024 * 1024) { // 10MB limit
        return res.status(413).json({ 
          error: 'Request too large',
          message: 'Request size exceeds 10MB limit'
        });
      }

      next();
    };
  }

  /**
   * Validate API key format
   */
  static validateApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    // API keys should be at least 32 characters
    return apiKey.length >= 32 && /^[a-zA-Z0-9_-]+$/.test(apiKey);
  }

  /**
   * Validate investment amount
   */
  static validateInvestmentAmount(amount: number, min: number, max: number): boolean {
    return typeof amount === 'number' && 
           amount >= min && 
           amount <= max && 
           amount > 0 &&
           Number.isFinite(amount);
  }
}

// Export validation middleware
export const validationMiddleware = SecurityValidator.createValidationMiddleware();