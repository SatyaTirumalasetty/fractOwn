# fractOWN - Fractional Real Estate Investment Platform

## Overview
fractOWN is a production-ready web application designed to democratize real estate investment in India by enabling fractional ownership of premium properties. The platform allows users to invest with a low entry barrier (₹10L), benefiting from property appreciation. It offers a comprehensive investment experience including property browsing, investment calculators, portfolio tracking, and contact management. The production deployment is configured for the custom domain fractown.in with comprehensive security, backup systems, and data protection.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React 18 with TypeScript, following a component-based, single-page application (SPA) pattern. Styling is managed with Tailwind CSS and custom design tokens. Key libraries include shadcn/ui for UI components, Wouter for routing, TanStack Query for server state management, and React Hook Form with Zod for form handling and validation.

### Backend Architecture
The server-side uses Express.js with TypeScript, implementing a RESTful API pattern for managing properties and contacts. It features an abstracted storage layer and uses Zod schemas for request validation, ensuring type safety.

### Data Management
The system emphasizes end-to-end type safety, utilizing shared TypeScript types and Zod schemas across both client and server to define data structures. TanStack Query manages data caching, synchronization, and optimistic updates on the client side.

### Development Architecture
The project utilizes Vite for fast development builds and hot module replacement, with npm for package management. The codebase is organized as a monorepo for clear separation of concerns and shared schemas.

### Configuration Architecture
The application uses a centralized configuration system supporting multi-environment setups (development, staging, production). It manages database flexibility, file upload settings, security parameters (session management, CORS, rate limiting, authentication), business logic (investment limits, regions, currency), and feature flags. All configurations support environment variable overrides.

### Security Implementation
Key security measures include TOTP authentication with AES-256-GCM encryption for secrets, cryptographically secure backup codes, comprehensive security event logging, rate limiting, session token validation, password hashing (Bcrypt), security headers (Helmet), CORS, API rate limiting, NoSQL injection protection (Express Mongo Sanitize), and XSS protection (DOMPurify). The system adheres to OWASP Top 10 and NIST Cybersecurity Framework guidelines.

### Performance Optimizations
The platform includes custom performance monitoring for request timing and memory usage, LRU caching, database query monitoring, and multi-layer caching (session, property, config).

### Production Database Backup System
Comprehensive backup and restore solution implemented with full production data protection. Features include automated backup creation with metadata tracking, integrity verification, environment-specific safety checks, and disaster recovery capabilities. The system supports complete database backups covering properties and contacts with detailed logging and error handling. Commands available: create backups with descriptions, list all available backups, restore from backup files (with confirmation requirements), and verify backup integrity. Backup files stored as JSON in ./backups/ directory with timestamp-based naming. Dual backup strategy available using both custom scripts and Replit's native point-in-time recovery features.

### Logo Management System
The platform integrates a complete logo management system allowing dynamic logo fetching from admin settings, with backend routes for upload and save, file validation, object storage integration, and cache invalidation.

### Property Management & File Upload System
The system now supports comprehensive property management with enhanced file upload capabilities. Property values use bigint data types to handle large real estate investments (₹50+ crores). File uploads support multiple formats including images (JPG, PNG, GIF, WebP), documents (PDF, DOC, DOCX), spreadsheets (XLS, XLSX), text files (TXT, CSV), and archives (ZIP) with validation and cloud storage integration.

### Dynamic Property Metadata System
The platform includes a complete dynamic metadata management system allowing unlimited custom fields for properties. Custom fields support multiple data types (Text, Number, Boolean, Date, Email, URL, Currency, Percentage) and are stored as JSON in the customFields column. The CustomFieldsManager component provides full CRUD operations through the admin interface.

### Dynamic Site Statistics Management System
Complete real-time statistics management system allowing admins to control all dynamic content displayed on the homepage. Features include:
- Database-driven statistics storage with categories (Platform Statistics, Investment Settings, Content Values)
- Real-time updates reflected immediately on homepage without browser refresh
- Admin dashboard interface for easy statistics management
- Production-safe initialization that preserves existing production values
- Support for currency and number formats (₹50 Cr+, 20+, etc.)
- Audit logging and environment protection for all updates

### Homepage Sections Management System
Complete dynamic homepage sections control system implemented on August 14, 2025. Features include:
- Database-driven section configuration with 7 default sections (Hero, Properties, How It Works, Testimonials, About, Risk Disclosure, Contact)
- Admin interface with drag-and-drop reordering and toggle controls for enabling/disabling sections
- Real-time homepage updates reflecting section changes without browser refresh
- RESTful API endpoints for section management (/api/homepage-sections, /api/admin/homepage-sections)
- Production-safe section initialization preserving existing configurations
- Comprehensive error handling and user feedback through toast notifications
- WebSocket real-time updates for immediate section visibility changes

### Production Data Protection System  
Comprehensive multi-layer production data protection system with complete isolation between development and production environments. Includes production-safe statistics initialization that resolves "No statistics found" issues in production deployments. 

**Server-Side Protection:**
- ProductionProtection class with comprehensive environment detection (NODE_ENV, REPL_DEPLOYMENT, hostname, database URL patterns)
- DatabaseProtection class prevents destructive operations in production (seeding, reset, migration overrides)
- Site statistics initialization with production-safe seeding that never overrides existing production values
- Audit logging for all statistics updates with environment context
- Production protection middleware for sensitive API endpoints
- Environment status API endpoint for monitoring protection status

**Client-Side Protection:**
- ClientEnvironmentProtection class with hostname-based environment detection
- Environment-specific localStorage keys (development uses _dev suffix, production uses _prod suffix)
- Custom field definitions isolated by environment to prevent cross-environment data pollution
- Safe data migration functions that block in production environments

**Statistics Management Protection:**
- Site statistics seeding only occurs in development environments
- Production statistics values are never overridden during deployments
- Real-time statistics updates work independently in each environment
- Admin dashboard shows environment-specific values without cross-contamination

**Key Features:**
- Automatic environment detection with multiple fallback indicators
- Complete data isolation between development and production
- Graceful handling of missing data in production with user-friendly admin interface
- Audit trails and logging for all data operations
- Zero risk of development data overriding production during deployment

## External Dependencies

### Security and Authentication
- **Speakeasy**: TOTP (Time-based One-Time Password) authentication.
- **QRCode**: QR code generation for TOTP setup.
- **Bcrypt**: Password hashing.
- **Helmet**: Security headers middleware.
- **CORS**: Cross-origin request security.
- **Express Rate Limit**: API rate limiting.
- **Express Mongo Sanitize**: NoSQL injection protection.
- **DOMPurify**: XSS protection and input sanitization.

### Database and ORM
- **Drizzle ORM**: Type-safe ORM for PostgreSQL.
- **PostgreSQL**: Primary database.
- **Neon Database**: Serverless PostgreSQL provider.

### UI and Styling
- **Radix UI**: Headless UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Class Variance Authority**: For component variant management.
- **shadcn/ui**: Reusable UI components.

### Development Tools
- **Vite**: Build tool and development server.
- **ESBuild**: Fast JavaScript bundler.
- **PostCSS**: CSS processing.
- **TypeScript**: Static type checking.

### Performance and Monitoring
- **Custom Performance Monitor**: Request timing and memory tracking.
- **LRU Cache**: In-memory caching.
- **Database Query Monitor**: Tracks slow queries.

### Third-party Integrations
- **Unsplash**: External image hosting (development/demo).
- **Date-fns**: Date manipulation and formatting utilities.
- **Embla Carousel**: Carousel component.
- **Google Cloud Storage**: Object storage for logo management.