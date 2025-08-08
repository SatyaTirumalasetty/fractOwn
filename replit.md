# fractOWN - Fractional Real Estate Investment Platform

## Overview
fractOWN is a web application designed to democratize real estate investment in India by enabling fractional ownership of premium properties. The platform allows users to invest with a low entry barrier (₹10L), benefiting from property appreciation. It offers a comprehensive investment experience including property browsing, investment calculators, portfolio tracking, and contact management. The project aims to provide a secure, scalable, and user-friendly platform for real estate investment.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React 18 with TypeScript, following a component-based, single-page application (SPA) pattern. Styling is managed with Tailwind CSS and custom design tokens for consistent theming. Key libraries include shadcn/ui for UI components, Wouter for routing, TanStack Query for server state management, and React Hook Form with Zod for form handling and validation. Custom CSS variables enable consistent branding.

### Backend Architecture
The server-side uses Express.js with TypeScript, implementing a RESTful API pattern for managing properties and contacts. It features an abstracted storage layer, currently in-memory for development, designed for future database integration. Zod schemas are used for request validation, ensuring type safety. Vite is integrated for hot module replacement during development.

### Data Management
The system emphasizes end-to-end type safety. Shared TypeScript types and Zod schemas are used across both client and server to define data structures. Centralized validation logic is applied using Zod. TanStack Query manages data caching, synchronization, and optimistic updates on the client side.

### Development Architecture
The project utilizes Vite for fast development builds and hot module replacement, with npm for package management. TypeScript is configured with path mapping for clean imports. The codebase is organized as a monorepo, ensuring clear separation of concerns and shared schemas.

### Configuration Architecture
The application uses a centralized configuration system (`config/app.config.js`) supporting multi-environment setups (development, staging, production). It manages database flexibility (PostgreSQL, MySQL, SQLite), file upload settings, security parameters (session management, CORS, rate limiting, authentication), business logic (investment limits, regions, currency), and feature flags. A separate `config/support.config.js` is reserved for authorized support team access, containing scripts for database migrations, maintenance, emergency recovery, and security auditing. All configurations support environment variable overrides for flexible deployment.

## External Dependencies

### Security and Authentication
- **Speakeasy**: TOTP (Time-based One-Time Password) authentication.
- **QRCode**: QR code generation for TOTP setup.
- **Bcrypt**: Password hashing with salt.
- **Helmet**: Security headers middleware.
- **CORS**: Cross-origin request security.
- **Express Rate Limit**: API rate limiting.
- **Express Mongo Sanitize**: NoSQL injection protection.
- **DOMPurify**: XSS protection and input sanitization.

### Database and ORM
- **Drizzle ORM**: Type-safe ORM for PostgreSQL.
- **PostgreSQL**: Primary database (configured).
- **Neon Database**: Serverless PostgreSQL provider for cloud deployment.

### UI and Styling
- **Radix UI**: Headless UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Class Variance Authority**: For component variant management.

### Development Tools
- **Vite**: Build tool and development server.
- **ESBuild**: Fast JavaScript bundler.
- **PostCSS**: CSS processing.
- **TypeScript**: Static type checking.

### Performance and Monitoring
- **Custom Performance Monitor**: Request timing and memory tracking.
- **LRU Cache**: In-memory caching for improved performance.
- **Database Query Monitor**: Tracks slow queries and optimization.

### Third-party Integrations
- **Unsplash**: External image hosting (development/demo).
- **Date-fns**: Date manipulation and formatting utilities.
- **Embla Carousel**: Carousel component.

## Security Implementation

### TOTP Authentication
- AES-256-GCM encryption for TOTP secrets at rest
- Cryptographically secure backup code generation
- Comprehensive security event logging
- Rate limiting on authentication endpoints
- Session token validation and secure cookie handling

### Performance Optimizations
- Request performance monitoring and alerting
- Memory usage tracking and garbage collection
- Database query performance analysis
- Multi-layer caching system (session, property, config)
- Endpoint-specific performance metrics

### Industry Compliance
- OWASP Top 10 security measures implemented
- NIST Cybersecurity Framework alignment
- RFC 6238 TOTP specification compliance
- Enhanced input validation and sanitization
- Comprehensive security audit documentation

## Recent Security Updates (August 2025)

### Cryptographic Service Security Hardening
Fixed multiple security vulnerabilities in `server/security/crypto.ts`:

1. **Master Key Security**: Removed insecure fallback key generation. Now requires mandatory MASTER_ENCRYPTION_KEY environment variable with minimum 32-character length.

2. **Error Message Security**: Sanitized error messages to prevent information disclosure attacks. Error details are logged server-side but generic messages are returned to clients.

3. **OTP Generation Security**: Fixed modulo bias vulnerability in OTP generation using rejection sampling technique to ensure uniform distribution.

4. **Input Validation**: Added comprehensive input validation for all cryptographic operations including type checking, format validation, and size limits.

5. **Timing Attack Protection**: Enhanced backup code verification with proper input validation and consistent error responses to prevent timing attacks.

6. **Memory Management**: Improved secure memory wiping function to work with Buffer objects instead of strings (though full memory wiping remains limited by Node.js garbage collection).

### Auto-Setup Script Security Hardening (August 2025)
Fixed critical command injection vulnerability in `scripts/auto-setup.js`:

1. **Command Injection Prevention**: Replaced vulnerable `exec()` function with safer `execFile()` to prevent shell injection attacks.

2. **Command Whitelisting**: Implemented strict whitelist of allowed commands (npx, npm, node) to prevent execution of malicious commands.

3. **Input Validation**: Added comprehensive validation for command arrays and database URLs with protocol verification.

4. **Environment Security**: Added root user detection and working directory validation to prevent execution in unsafe environments.

5. **Resource Limits**: Implemented command timeouts (2 minutes) and buffer limits (1MB) to prevent resource exhaustion attacks.

6. **Database URL Validation**: Added URL parsing and protocol validation to ensure only PostgreSQL connections are allowed.

These changes eliminate the risk of command injection while maintaining full functionality of the setup process.

### Deployment Configuration Security Issue (August 2025)
Identified critical security vulnerability in Replit deployment configuration:

**Issue**: The `.replit` file deployment section uses `npm run dev` (development server) instead of production build commands, exposing sensitive debugging information and creating security risks.

**Risk Level**: HIGH - Development servers expose internal application details, debug information, and are not optimized for production security.

**Solutions Provided**:

1. **Secure Production Deployment Script**: Created `scripts/deploy-production.js` with comprehensive security validation:
   - Forces `NODE_ENV=production` environment
   - Validates all required production environment variables
   - Prevents use of default session secrets
   - Implements secure command execution with timeouts
   - Builds optimized production bundles
   - Provides security validation checklist

2. **Security Documentation**: Created `SECURITY-DEPLOYMENT.md` detailing:
   - Security implications of development vs production servers
   - Step-by-step secure deployment process
   - Environment variable security requirements
   - Manual deployment procedures for immediate compliance

**Recommended Action**: Update `.replit` deployment configuration to use `npm run build && npm run start` instead of `npm run dev` to ensure production security compliance.

### GCM Authentication Tag Length Vulnerability (August 2025)
Fixed critical cryptographic vulnerability in GCM mode decryption operations:

**Issue**: The `createDecipheriv` calls with AES-256-GCM mode were missing explicit authentication tag length validation, potentially allowing attackers to use truncated authentication tags to bypass cryptographic verification.

**Risk Level**: CRITICAL - Could allow authentication bypass and arbitrary data forgery in GCM encrypted data.

**Files Affected**:
- `server/security/crypto.ts` - TOTP secret encryption/decryption
- `server/storage/encryptionService.ts` - Property data and file encryption

**Security Fixes Applied**:

1. **Authentication Tag Length Validation**: Added explicit validation that authentication tags are exactly 16 bytes (128 bits) before decryption operations.

2. **Tag Truncation Prevention**: Implemented checks to reject both short and long authentication tags that could indicate tampering attempts.

3. **Type Safety Improvements**: Added proper TypeScript casting to `DecipherGCM` type to access GCM-specific methods safely.

4. **Comprehensive Security Testing**: Created `tests/security/gcm-auth-tag-test.js` with 5 security test cases validating:
   - Valid tag length acceptance
   - Short tag rejection (< 16 bytes)
   - Long tag rejection (> 16 bytes)  
   - Zero-length tag rejection
   - CryptoService specific validation

**Security Impact**: This comprehensive fix prevents multiple attack vectors across all GCM encryption implementations:

**Files Secured**:
- `server/security/crypto.ts` - TOTP secrets and sensitive data encryption
- `server/storage/encryptionService.ts` - Property data and file encryption (text and binary)

**Attack Vectors Prevented**:
- Authentication tag truncation attacks using shortened tags (< 16 bytes)
- Authentication tag extension attacks using oversized tags (> 16 bytes) 
- Zero-byte tag injection attacks
- All-zero authentication tag bypass attempts
- Tampering detection through enhanced error handling
- Cryptographic forgery of encrypted TOTP secrets, property data, and file content
- Bypass attempts on file encryption validation systems

**Implementation Features**:
- Multi-layer validation with comprehensive length and content checks
- Enhanced error handling with tampering detection
- Proper TypeScript typing for type safety
- Consistent security across text and file encryption operations
- Extensive security testing and validation
- Complete protection for both encryption and decryption operations

This implementation ensures maximum protection against all known GCM authentication tag vulnerabilities and maintains the highest cryptographic security standards for the fractOWN platform.