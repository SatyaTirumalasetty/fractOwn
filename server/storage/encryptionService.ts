/**
 * Encryption Service for fractOWN
 * Handles encryption/decryption of sensitive data and file content
 */

import crypto from 'crypto';

export interface EncryptedData {
  encryptedContent: string;
  iv: string;
  authTag: string;
  algorithm: string;
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  checksum: string;
  isEncrypted: boolean;
}

export class EncryptionService {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly keyLength = 32; // 256 bits
  private static readonly ivLength = 16; // 128 bits
  private static readonly tagLength = 16; // 128 bits - REQUIRED for security
  
  // Generate encryption key from environment or create secure default
  private static readonly encryptionKey = this.getOrCreateEncryptionKey();

  /**
   * Gets encryption key from environment or generates a secure one
   */
  private static getOrCreateEncryptionKey(): Buffer {
    const envKey = process.env.ENCRYPTION_KEY;
    if (envKey) {
      return Buffer.from(envKey, 'hex');
    }
    
    // Generate a secure key for development (in production, this should be set via environment)
    console.warn('Warning: Using auto-generated encryption key. Set ENCRYPTION_KEY in production!');
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Encrypts text data (for database storage)
   */
  static encryptText(plaintext: string): EncryptedData {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      cipher.setAAD(Buffer.from('fractown-data'));

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Security: Ensure authentication tag is exactly the expected length
      if (authTag.length !== this.tagLength) {
        throw new Error('Generated authentication tag has invalid length');
      }

      return {
        encryptedContent: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: this.algorithm
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts text data (for UI rendering)
   */
  static decryptText(encryptedData: EncryptedData): string {
    try {
      // Security: Validate authentication tag length to prevent tag truncation attacks
      const authTagBuffer = Buffer.from(encryptedData.authTag, 'hex');
      if (authTagBuffer.length !== this.tagLength) {
        throw new Error('Invalid authentication tag length');
      }
      
      // Additional validation: Ensure tag contains non-zero bytes (prevent empty/zero tags)
      if (authTagBuffer.every(byte => byte === 0)) {
        throw new Error('Invalid authentication tag: all zeros detected');
      }
      
      const decipher = crypto.createDecipheriv(
        encryptedData.algorithm, 
        this.encryptionKey, 
        Buffer.from(encryptedData.iv, 'hex'),
        { authTagLength: this.tagLength } as any
      ) as crypto.DecipherGCM;
      
      decipher.setAAD(Buffer.from('fractown-data'));
      
      // Security: Set authentication tag with additional integrity checks
      try {
        decipher.setAuthTag(authTagBuffer);
      } catch (authError) {
        // If setAuthTag fails, it indicates potential tampering
        throw new Error('Authentication tag validation failed - potential tampering detected');
      }

      let decrypted = decipher.update(encryptedData.encryptedContent, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypts file buffer (for secure storage)
   */
  static encryptFile(fileBuffer: Buffer, metadata: FileMetadata): {
    encryptedBuffer: Buffer;
    encryptedMetadata: EncryptedData;
    fileHash: string;
    iv: string;
    authTag: string;
  } {
    try {
      // Generate checksum for integrity verification
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      // Encrypt file content
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      cipher.setAAD(Buffer.from('fractown-file'));

      const encryptedChunks: Buffer[] = [];
      encryptedChunks.push(cipher.update(fileBuffer));
      encryptedChunks.push(cipher.final());
      
      const encryptedBuffer = Buffer.concat(encryptedChunks);
      const authTag = cipher.getAuthTag();
      
      // Security: Ensure authentication tag is exactly the expected length
      if (authTag.length !== this.tagLength) {
        throw new Error('Generated authentication tag has invalid length');
      }

      // Encrypt metadata
      const metadataWithHash = { ...metadata, checksum: fileHash, isEncrypted: true };
      const encryptedMetadata = this.encryptText(JSON.stringify(metadataWithHash));

      return {
        encryptedBuffer,
        encryptedMetadata,
        fileHash,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      console.error('File encryption failed:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  /**
   * Decrypts file buffer (for download/display)
   */
  static decryptFile(encryptedBuffer: Buffer, encryptedMetadata: EncryptedData, authTag: string, iv: string): {
    fileBuffer: Buffer;
    metadata: FileMetadata;
  } {
    try {
      // Decrypt metadata first
      const metadataJson = this.decryptText(encryptedMetadata);
      const metadata: FileMetadata = JSON.parse(metadataJson);

      // Security: Validate authentication tag length to prevent tag truncation attacks
      const authTagBuffer = Buffer.from(authTag, 'hex');
      if (authTagBuffer.length !== this.tagLength) {
        throw new Error('Invalid authentication tag length');
      }
      
      // Additional validation: Ensure tag contains non-zero bytes (prevent empty/zero tags)
      if (authTagBuffer.every(byte => byte === 0)) {
        throw new Error('Invalid authentication tag: all zeros detected');
      }
      
      // Decrypt file content with enhanced security parameters
      const decipher = crypto.createDecipheriv(
        this.algorithm, 
        this.encryptionKey, 
        Buffer.from(iv, 'hex'),
        { authTagLength: this.tagLength } as any
      ) as crypto.DecipherGCM;
      
      decipher.setAAD(Buffer.from('fractown-file'));
      
      // Security: Set authentication tag with additional integrity checks
      try {
        decipher.setAuthTag(authTagBuffer);
      } catch (authError) {
        // If setAuthTag fails, it indicates potential tampering
        throw new Error('Authentication tag validation failed - potential tampering detected');
      }

      const decryptedChunks: Buffer[] = [];
      decryptedChunks.push(decipher.update(encryptedBuffer));
      decryptedChunks.push(decipher.final());
      
      const fileBuffer = Buffer.concat(decryptedChunks);

      // Verify file integrity
      const calculatedHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      if (calculatedHash !== metadata.checksum) {
        throw new Error('File integrity check failed');
      }

      return { fileBuffer, metadata };
    } catch (error) {
      console.error('File decryption failed:', error);
      throw new Error('Failed to decrypt file');
    }
  }

  /**
   * Encrypts sensitive property data for database storage
   */
  static encryptPropertyData(propertyData: any): any {
    const sensitiveFields = ['description', 'attachments'];
    const encryptedData = { ...propertyData };

    sensitiveFields.forEach(field => {
      if (encryptedData[field]) {
        const encrypted = this.encryptText(JSON.stringify(encryptedData[field]));
        encryptedData[`${field}_encrypted`] = encrypted;
        encryptedData[`${field}_is_encrypted`] = true;
        delete encryptedData[field]; // Remove plain text
      }
    });

    return encryptedData;
  }

  /**
   * Decrypts sensitive property data for UI rendering
   */
  static decryptPropertyData(encryptedPropertyData: any): any {
    const decryptedData = { ...encryptedPropertyData };
    
    // Check for encrypted fields and decrypt them
    Object.keys(decryptedData).forEach(key => {
      if (key.endsWith('_encrypted') && decryptedData[`${key.replace('_encrypted', '_is_encrypted')}`]) {
        const originalField = key.replace('_encrypted', '');
        try {
          const decryptedContent = this.decryptText(decryptedData[key]);
          decryptedData[originalField] = JSON.parse(decryptedContent);
          
          // Clean up encrypted fields
          delete decryptedData[key];
          delete decryptedData[`${originalField}_is_encrypted`];
        } catch (error) {
          console.error(`Failed to decrypt field ${originalField}:`, error);
          // Keep encrypted data if decryption fails
        }
      }
    });

    return decryptedData;
  }

  /**
   * Generates a secure file token for access control
   */
  static generateFileToken(fileId: string, userId: string, expiresIn: number = 3600): string {
    const payload = {
      fileId,
      userId,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
      iss: 'fractown'
    };

    const token = crypto
      .createHmac('sha256', this.encryptionKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return Buffer.from(JSON.stringify({ ...payload, token })).toString('base64');
  }

  /**
   * Verifies and decodes file access token
   */
  static verifyFileToken(token: string): { fileId: string; userId: string; exp: number } | null {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      
      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      // Verify token signature
      const expectedToken = crypto
        .createHmac('sha256', this.encryptionKey)
        .update(JSON.stringify({ fileId: payload.fileId, userId: payload.userId, exp: payload.exp, iss: payload.iss }))
        .digest('hex');

      if (expectedToken !== payload.token) {
        return null;
      }

      return { fileId: payload.fileId, userId: payload.userId, exp: payload.exp };
    } catch (error) {
      return null;
    }
  }
}

export default EncryptionService;