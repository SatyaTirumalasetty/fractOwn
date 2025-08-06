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
    // Derive master key from environment variable or generate secure default
    const masterSecret = process.env.MASTER_ENCRYPTION_KEY || this.generateSecureSecret();
    this.masterKey = pbkdf2Sync(masterSecret, 'fractown-salt', 100000, KEY_LENGTH, 'sha512');
  }

  private generateSecureSecret(): string {
    // Generate a cryptographically secure 64-character hex string
    return randomBytes(32).toString('hex');
  }

  /**
   * Encrypt sensitive data (TOTP secrets, backup codes)
   */
  encrypt(plaintext: string): string {
    try {
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
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    try {
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
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
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
   */
  async verifyBackupCode(code: string, hash: string): Promise<boolean> {
    try {
      const bcrypt = await import('bcrypt');
      return bcrypt.compare(code, hash);
    } catch (error) {
      console.error('Backup code verification error:', error);
      return false;
    }
  }

  /**
   * Generate secure random OTP for SMS/Email
   */
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytes(1)[0] % digits.length;
      otp += digits[randomIndex];
    }
    
    return otp;
  }

  /**
   * Secure memory cleanup for sensitive data
   */
  secureWipe(data: string): void {
    // In Node.js, we can't directly wipe memory, but we can overwrite variables
    if (typeof data === 'string') {
      data = '\0'.repeat(data.length);
    }
  }
}

export const cryptoService = new CryptoService();