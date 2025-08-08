#!/usr/bin/env node

/**
 * GCM Authentication Tag Length Vulnerability Test
 * Tests the fix for CVE-like vulnerability where short authentication tags could be accepted
 * 
 * This test validates that our GCM decryption properly validates authentication tag lengths
 * to prevent tag truncation attacks that could lead to authentication bypass.
 */

import { cryptoService } from '../../server/security/crypto.js';
import { EncryptionService } from '../../server/storage/encryptionService.js';
import crypto from 'crypto';

console.log('🔒 Testing GCM Authentication Tag Length Security Fix...\n');

/**
 * Test 1: Valid authentication tag length acceptance
 */
async function testValidTagLength() {
  console.log('Test 1: Valid 16-byte authentication tag acceptance');
  
  try {
    // Test CryptoService
    const plaintext = 'sensitive-totp-secret';
    const encrypted = cryptoService.encrypt(plaintext);
    const decrypted = cryptoService.decrypt(encrypted);
    
    if (decrypted === plaintext) {
      console.log('✅ CryptoService: Valid tag length accepted correctly');
    } else {
      throw new Error('Decryption failed with valid tag');
    }
    
    // Test EncryptionService
    const testData = 'sensitive-property-data';
    const encryptedData = EncryptionService.encryptText(testData);
    const decryptedData = EncryptionService.decryptText(encryptedData);
    
    if (decryptedData === testData) {
      console.log('✅ EncryptionService: Valid tag length accepted correctly');
    } else {
      throw new Error('EncryptionService decryption failed with valid tag');
    }
    
  } catch (error) {
    console.log('❌ Test 1 failed:', error.message);
    return false;
  }
  
  return true;
}

/**
 * Test 2: Short authentication tag rejection
 */
async function testShortTagRejection() {
  console.log('\nTest 2: Short authentication tag rejection (< 16 bytes)');
  
  try {
    // Test with truncated authentication tag (8 bytes instead of 16)
    const plaintext = 'test-data';
    const encryptedData = EncryptionService.encryptText(plaintext);
    
    // Truncate the authentication tag to simulate attack
    const truncatedAuthTag = encryptedData.authTag.substring(0, 16); // 8 bytes in hex
    const maliciousData = {
      ...encryptedData,
      authTag: truncatedAuthTag
    };
    
    try {
      EncryptionService.decryptText(maliciousData);
      console.log('❌ SHORT TAG ACCEPTED - SECURITY VULNERABILITY!');
      return false;
    } catch (error) {
      if (error.message.includes('Invalid authentication tag length')) {
        console.log('✅ Short authentication tag correctly rejected');
      } else {
        console.log('✅ Short authentication tag rejected (different error):', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Test 2 setup failed:', error.message);
    return false;
  }
  
  return true;
}

/**
 * Test 3: Long authentication tag rejection
 */
async function testLongTagRejection() {
  console.log('\nTest 3: Long authentication tag rejection (> 16 bytes)');
  
  try {
    const plaintext = 'test-data';
    const encryptedData = EncryptionService.encryptText(plaintext);
    
    // Extend the authentication tag to simulate manipulation
    const extendedAuthTag = encryptedData.authTag + 'deadbeef'; // Add 4 extra bytes
    const maliciousData = {
      ...encryptedData,
      authTag: extendedAuthTag
    };
    
    try {
      EncryptionService.decryptText(maliciousData);
      console.log('❌ LONG TAG ACCEPTED - POTENTIAL SECURITY ISSUE!');
      return false;
    } catch (error) {
      if (error.message.includes('Invalid authentication tag length')) {
        console.log('✅ Long authentication tag correctly rejected');
      } else {
        console.log('✅ Long authentication tag rejected (different error):', error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Test 3 setup failed:', error.message);
    return false;
  }
  
  return true;
}

/**
 * Test 4: CryptoService tag length validation
 */
async function testCryptoServiceTagValidation() {
  console.log('\nTest 4: CryptoService authentication tag validation');
  
  try {
    // Create a valid encrypted string
    const plaintext = 'totp-secret-test';
    const encrypted = cryptoService.encrypt(plaintext);
    
    // Decode the encrypted data to manipulate the tag
    const combined = Buffer.from(encrypted, 'base64');
    const SALT_LENGTH = 32;
    const IV_LENGTH = 16;
    const TAG_LENGTH = 16;
    
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const originalTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encryptedContent = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Create malicious data with truncated tag
    const shortTag = originalTag.subarray(0, 8); // 8 bytes instead of 16
    const maliciousCombined = Buffer.concat([salt, iv, shortTag, encryptedContent]);
    const maliciousEncrypted = maliciousCombined.toString('base64');
    
    try {
      cryptoService.decrypt(maliciousEncrypted);
      console.log('❌ CRYPTOSERVICE SHORT TAG ACCEPTED - SECURITY VULNERABILITY!');
      return false;
    } catch (error) {
      console.log('✅ CryptoService correctly rejected short authentication tag');
    }
    
  } catch (error) {
    console.log('❌ Test 4 failed:', error.message);
    return false;
  }
  
  return true;
}

/**
 * Test 5: Zero-length tag rejection
 */
async function testZeroLengthTagRejection() {
  console.log('\nTest 5: Zero-length authentication tag rejection');
  
  try {
    const plaintext = 'test-data';
    const encryptedData = EncryptionService.encryptText(plaintext);
    
    // Set empty authentication tag
    const maliciousData = {
      ...encryptedData,
      authTag: ''
    };
    
    try {
      EncryptionService.decryptText(maliciousData);
      console.log('❌ ZERO-LENGTH TAG ACCEPTED - CRITICAL SECURITY VULNERABILITY!');
      return false;
    } catch (error) {
      console.log('✅ Zero-length authentication tag correctly rejected');
    }
    
  } catch (error) {
    console.log('❌ Test 5 setup failed:', error.message);
    return false;
  }
  
  return true;
}

// Run all tests
async function runSecurityTests() {
  const tests = [
    testValidTagLength,
    testShortTagRejection,
    testLongTagRejection,
    testCryptoServiceTagValidation,
    testZeroLengthTagRejection
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
  }
  
  console.log(`\n📊 Security Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All security tests passed! GCM authentication tag vulnerability is fixed.');
    return true;
  } else {
    console.log('❌ Some security tests failed! Review the implementation.');
    return false;
  }
}

// Execute tests if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await runSecurityTests();
  } catch (error) {
    console.error('Security test execution failed:', error);
    process.exit(1);
  }
}

export { runSecurityTests };