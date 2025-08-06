# Data Persistence and Security Implementation Guide

## Overview
This document outlines the secure data persistence implementation for the fractOWN platform, focusing on TOTP authentication security and performance optimization.

## Database Security Implementation

### 1. TOTP Secret Encryption
All TOTP secrets are encrypted at rest using AES-256-GCM encryption:

```typescript
// Encryption process
const encryptedSecret = cryptoService.encrypt(secret.base32);
await storage.updateAdminTOTPSecret(adminId, encryptedSecret);

// Decryption process
const encryptedSecret = await storage.getAdminTOTPSecret(adminId);
const secret = cryptoService.decrypt(encryptedSecret);
```

### 2. Backup Code Security
Backup codes are generated cryptographically and hashed before storage:

```typescript
// Generation and hashing
const backupCodes = cryptoService.generateBackupCodes(8);
const hashedBackupCodes = await Promise.all(
  backupCodes.map(code => cryptoService.hashBackupCode(code))
);
```

### 3. Session Management
Enhanced session security with:
- Cryptographically secure session tokens
- Session validation middleware
- Secure cookie configuration
- Session caching for performance

## Performance Optimizations

### 1. Database Query Monitoring
Real-time monitoring of database performance:
- Query execution time tracking
- Slow query detection and logging
- Performance metrics collection

### 2. Multi-Layer Caching
- **Session Cache**: 1-hour TTL for active sessions
- **Property Cache**: 10-minute TTL for property listings
- **Config Cache**: 30-minute TTL for configuration data
- **Query Cache**: 5-minute TTL for frequently accessed queries

### 3. Rate Limiting
Security-focused rate limiting:
- Authentication endpoints: 5 attempts per 15 minutes
- TOTP endpoints: 3 attempts per 5 minutes
- Admin operations: 100 requests per 10 minutes
- General API: 60 requests per minute

## Security Event Logging

### 1. TOTP Security Events
All TOTP-related activities are logged:
```typescript
totpSecurityManager.logSecurityEvent({
  adminId: req.user.id,
  ip: req.ip || 'unknown',
  userAgent: req.get('User-Agent') || 'unknown',
  action: 'generate' | 'verify' | 'backup_used' | 'disabled',
  success: boolean
});
```

### 2. Suspicious Activity Detection
- Multiple failed authentication attempts
- Unusual IP address patterns
- Rapid TOTP setup attempts
- Automated alerts for security events

## Industry Compliance

### 1. OWASP Top 10 Protection
- **A1: Injection**: Input sanitization with DOMPurify
- **A2: Broken Authentication**: Enhanced session management
- **A3: Sensitive Data Exposure**: AES-256-GCM encryption
- **A5: Security Misconfiguration**: Helmet security headers
- **A6: Vulnerable Components**: Regular dependency updates
- **A7: XSS**: Comprehensive input validation
- **A10: Logging**: Security event monitoring

### 2. NIST Cybersecurity Framework
- **Identify**: Asset inventory and risk assessment
- **Protect**: Access controls and data protection
- **Detect**: Security monitoring and alerting
- **Respond**: Incident response procedures
- **Recover**: Backup and recovery systems

### 3. RFC 6238 TOTP Compliance
- Standard 30-second time windows
- SHA-1 algorithm for compatibility
- 6-digit token length
- Proper secret key generation (256-bit entropy)

## Data Backup and Recovery

### 1. Backup Strategy
- Encrypted backups of TOTP secrets
- Regular database snapshots
- Configuration backup procedures
- Security event log archival

### 2. Recovery Procedures
- Emergency backup code access
- TOTP secret recovery process
- Database restoration procedures
- Security event reconstruction

## Monitoring and Alerting

### 1. Real-Time Metrics
- Response time monitoring
- Memory usage tracking
- Database performance metrics
- Security event statistics

### 2. Alert Thresholds
- High memory usage (>100MB)
- Slow queries (>1000ms)
- Failed authentication attempts (>5 in 15 minutes)
- System performance degradation

## Best Practices

### 1. Development
- Use encrypted secrets in development
- Test with realistic data volumes
- Performance testing with load simulation
- Security testing with penetration tools

### 2. Production
- Enable all security features
- Monitor performance metrics
- Regular security audits
- Backup verification procedures

### 3. Maintenance
- Regular dependency updates
- Security patch management
- Performance optimization reviews
- Backup testing procedures

## Configuration Examples

### Environment Variables
```bash
# Encryption
MASTER_ENCRYPTION_KEY=your-256-bit-encryption-key

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Security
SESSION_SECRET=your-session-secret-key
NODE_ENV=production
```

### Security Headers
```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});
```

This implementation ensures enterprise-grade security and performance for the fractOWN platform while maintaining compliance with industry standards.