# fractOWN - Fractional Real Estate Investment Platform

## Overview
fractOWN is a web application designed to democratize real estate investment in India by enabling fractional ownership of premium properties. The platform allows users to invest with a low entry barrier (₹10L), benefiting from property appreciation. It offers a comprehensive investment experience including property browsing, investment calculators, portfolio tracking, and contact management, aiming to provide a secure, scalable, and user-friendly platform.

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

### Production Data Isolation
Comprehensive production deployment protection with multi-layer isolation ensures development data never migrates to production. Environment detection includes NODE_ENV, REPL_DEPLOYMENT, and hostname analysis. Seeding scripts automatically block in production environments. Custom field definitions use environment-specific localStorage keys (customFieldDefinitions_prod vs customFieldDefinitions_dev). Production systems gracefully handle missing field definitions and schema changes. Production data remains completely isolated and unaffected by development changes, with automatic environment detection, data segregation warnings, and resilient field handling that supports schema evolution without breaking existing functionality.

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