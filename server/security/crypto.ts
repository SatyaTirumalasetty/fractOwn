import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';

/**
 * Enterprise-grade cryptographic utilities for TOTP and sensitive data
 * Following NIST recommendations and industry best practices
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

class CryptoService {
  private masterKey: Buffer;

  constructor() {
    // Derive master key from environment variable - no fallback for security
    const masterSecret = process.env.MASTER_ENCRYPTION_KEY;
    if (!masterSecret) {
      throw new Error('MASTER_ENCRYPTION_KEY environment variable is required');
    }
    if (masterSecret.length < 32) {
      throw new Error('MASTER_ENCRYPTION_KEY must be at least 32 characters long');
    }
    this.masterKey = pbkdf2Sync(masterSecret, 'fractown-salt', 100000, KEY_LENGTH, 'sha512');
  }



  /**
   * Encrypt sensitive data (TOTP secrets, backup codes)
   */
  encrypt(plaintext: string): string {
    try {
      // Input validation
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Invalid input for encryption');
      }
      if (plaintext.length > 10000) { // Reasonable size limit
        throw new Error('Input data too large for encryption');
      }
      const iv = randomBytes(IV_LENGTH);
      const salt = randomBytes(SALT_LENGTH);
      
      // Derive key using PBKDF2 with salt
      const key = pbkdf2Sync(this.masterKey, salt, 10000, KEY_LENGTH, 'sha512');
      
      const cipher = createCipheriv(ALGORITHM, key, iv);
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      const tag = cipher.getAuthTag();
      
      // Combine salt + iv + tag + encrypted data
      const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'base64')]);
      return combined.toString('base64');
    } catch (error) {
      // Log error details for debugging, but don't expose them to client
      console.error('Encryption error:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Encryption operation failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    try {
      // Input validation
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid input for decryption');
      }
      
      // Validate base64 format
      if (!/^[A-Za-z0-9+/=]+$/.test(encryptedData)) {
        throw new Error('Invalid encrypted data format');
      }
      const combined = Buffer.from(encryptedData, 'base64');
      
      const salt = combined.subarray(0, SALT_LENGTH);
      const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      
      // Derive key using same PBKDF2 parameters
      const key = pbkdf2Sync(this.masterKey, salt, 10000, KEY_LENGTH, 'sha512');
      
      const decipher = createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      // Log error details for debugging, but don't expose them to client
      console.error('Decryption error:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Decryption operation failed');
    }
  }

  /**
   * Generate cryptographically secure session token
   */
  generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate secure backup codes
   */
  generateBackupCodes(count: number = 8): string[] {
    return Array.from({ length: count }, () => {
      // Generate 8-character alphanumeric codes
      const bytes = randomBytes(4);
      return bytes.toString('hex').toUpperCase();
    });
  }

  /**
   * Hash backup codes for secure storage
   */
  async hashBackupCode(code: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(code, 12);
  }

  /**
   * Verify backup code against hash
   * Uses constant-time comparison to prevent timing attacks
   */
  async verifyBackupCode(code: string, hash: string): Promise<boolean> {
    try {
      // Input validation
      if (!code || !hash || typeof code !== 'string' || typeof hash !== 'string') {
        return false;
      }
      
      // Basic format validation for backup codes (should be 8 hex chars)
      if (!/^[A-F0-9]{8}$/i.test(code)) {
        return false;
      }
      
      const bcrypt = await import('bcrypt');
      return bcrypt.compare(code.toUpperCase(), hash);
    } catch (error) {
      // Log error for debugging but don't expose details
      console.error('Backup code verification failed');
      return false;
    }
  }

  /**
   * Generate secure random OTP for SMS/Email
   * Uses rejection sampling to avoid modulo bias
   */
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      let randomByte: number;
      do {
        randomByte = randomBytes(1)[0];
      } while (randomByte >= 250); // Reject values that would cause modulo bias (250 is largest multiple of 10 < 256)
      
      const randomIndex = randomByte % digits.length;
      otp += digits[randomIndex];
    }
    
    return otp;
  }

  /**
   * Secure memory cleanup for sensitive data
   * Note: True memory wiping is not possible in Node.js due to garbage collection
   */
  secureWipe(buffer: Buffer): void {
    if (buffer && Buffer.isBuffer(buffer)) {
      buffer.fill(0);
    }
  }
}

export const cryptoService = new CryptoService();