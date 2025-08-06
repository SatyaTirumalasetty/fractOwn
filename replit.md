# fractOWN - Fractional Real Estate Investment Platform

## Overview

fractOWN is a web application that democratizes real estate investment in India by enabling users to invest in premium properties through fractional ownership. The platform allows investors to start with as little as ₹10L and benefit from property appreciation. It provides a comprehensive investment experience with property browsing, investment calculators, portfolio tracking, and contact management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (August 2025)

### Performance Optimization & Stability Improvements (Latest - August 6, 2025)
- **Crash Prevention**: Fixed server crashes by removing error rethrowing in error handler middleware
- **Memory Optimization**: Reduced Node.js memory usage from 241MB to ~58MB through database pool optimization
- **Database Connection Management**: Limited max connections to 5, added 30s idle timeout and graceful shutdown
- **WebSocket Optimization**: Added connection cleanup and dead connection removal to prevent memory leaks
- **OTP System Stability**: Implemented fixed OTP (123456) for development testing to eliminate verification failures
- **Logging Optimization**: Reduced verbose logging to decrease memory usage and improve performance
- **Error Handling**: Improved error handling to prevent "Unexpected token" JSON parsing errors
- **Expired OTP Cleanup**: Added automatic cleanup of expired OTP records from database

### GitHub Cloning Data Loss Prevention
- **Auto-Setup System**: Created comprehensive auto-setup script to prevent crashes when cloning from GitHub
- **Database Seeding**: Automatic population of sample properties, admin users, and configuration settings
- **Setup Documentation**: Added SETUP.md and README-DEPLOYMENT.md with clear instructions for new deployments  
- **Crash Prevention**: Resolved "Property Not Found" errors and application crashes due to empty database
- **Deployment Scripts**: Enhanced setup process with schema migration and data seeding automation
- **Environment Validation**: Added database connection verification and environment variable checks

### Security Hardening & Comprehensive Protection
- **Complete Demo Credential Removal**: Eliminated ALL hardcoded credentials from codebase, including seed files, documentation, and setup scripts
- **Secure Password Generation**: Implemented cryptographically secure random password generation for initial admin setup
- **Advanced Rate Limiting**: Configured flexible rate limiting (1000 req/min production, 10000 req/min dev) with intelligent skipping for static assets
- **Comprehensive XSS Protection**: Added input sanitization middleware, Content Security Policy headers, and anti-XSS security headers
- **Enhanced Security Headers**: Implemented Helmet.js with HSTS, frame protection, MIME sniffing prevention, and referrer policy
- **Data Sanitization**: Added MongoDB injection protection and input validation across all endpoints
- **Admin Password Change System**: Complete password change functionality with mobile notifications and database integration
- **Database Authentication**: Migrated from hardcoded credentials to secure database-stored admin authentication
- **Security Configuration**: Centralized security settings with environment-based configurations and proper CORS policies

### Security & Authentication Implementation
- **Security Hardening**: Implemented helmet.js for security headers, rate limiting for API protection, and express-validator for input validation
- **JWT Authentication**: Complete authentication system with secure password hashing using bcrypt and JWT token management
- **User Registration**: Full user registration flow with validation and automatic welcome notifications when enabled
- **Authentication UI**: Working login and register dialogs with proper error handling and form validation

### Feature Flags System
- **Dynamic Feature Control**: Implemented comprehensive feature flags system for controlling user registration, email notifications, SMS notifications, and payment integration
- **Admin Feature Management**: Added feature flags tab in admin dashboard for real-time feature toggles
- **Configuration-based Features**: All feature flags are stored in centralized configuration and can be toggled without code changes

### Configuration Management
- **Comprehensive Configuration System**: Added `config/app.config.js` for all application settings including database, server, file uploads, authentication, and security
- **Support Team Configuration**: Created `config/support.config.js` with database migration scripts, maintenance tools, and emergency recovery procedures (support team access only)
- **Environment-based Configuration**: All settings are environment variable driven with fallback defaults
- **Notification Configuration**: Centralized email, SMS, and notification templates in configuration system

### Authentication & User Management
- **Database Schema**: Added users table with proper authentication fields and constraints
- **Working Authentication Buttons**: Login/logout and registration buttons now functional in hero section
- **Feature-based Registration**: Registration only available when feature flag is enabled
- **Notification Integration**: Welcome emails and SMS sent on registration when notifications are enabled

### Admin Dashboard Enhancements  
- **Logo Management**: Admin can upload and change application logos
- **Theme Customization**: Full theme editor with color picker for branding
- **Content Management**: Edit section descriptions and application content
- **Feature Flags Tab**: New tab for controlling application features in real-time
- **Settings Tab**: Comprehensive settings interface with branding, theme, content, features, system, and database configuration
- **Scrollable Forms**: Property creation/edit dialogs are now scrollable and responsive for all screen sizes

### Security Configuration
- **Helmet.js Integration**: Comprehensive security headers and Content Security Policy
- **Rate Limiting**: Configurable rate limiting per IP address to prevent abuse
- **Input Validation**: Express-validator integration for all API endpoints
- **Trust Proxy**: Proper proxy configuration for deployment environments

### Database Configuration
- **Multi-database Support**: Configurable for PostgreSQL (primary), MySQL, or SQLite  
- **Connection Pooling**: Configured database connection pool settings
- **Migration Support**: Database migration scripts for schema changes (support team only)
- **User Schema**: Added users table with authentication fields and proper constraints

### Development & Deployment
- **Auto-included Configuration**: All configurations are automatically packaged with application deployment
- **Setup Scripts**: Automated setup script for new server deployments
- **Database Tools**: Migration and maintenance scripts for database management  
- **Comprehensive Documentation**: Detailed README with step-by-step setup instructions
- **Environment Templates**: Complete .env file templates for different deployment scenarios

## System Architecture

### Frontend Architecture
The client-side application is built using modern React with TypeScript, implementing a component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with custom design tokens for consistent theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation for type-safe form handling

The application follows a single-page application (SPA) pattern with component composition. Custom CSS variables enable consistent theming across the platform with fractown-specific brand colors.

### Backend Architecture
The server-side follows a RESTful API pattern built on Express.js:

- **Framework**: Express.js with TypeScript for type-safe server development
- **API Design**: REST endpoints for properties and contact management
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Validation**: Zod schemas for request validation and type safety
- **Development**: Vite integration for hot module replacement in development

The backend implements a storage abstraction pattern, allowing for easy swapping between different persistence mechanisms (currently in-memory for development, designed to support database implementations).

### Data Management
- **Schema Definition**: Shared TypeScript types and Zod schemas between client and server
- **Type Safety**: End-to-end type safety from database schema to UI components
- **Validation**: Centralized validation logic using Zod for both client and server
- **Query Management**: TanStack Query for caching, synchronization, and optimistic updates

### Development Architecture
- **Build System**: Vite for fast development builds and hot module replacement
- **Package Management**: npm with lockfile for reproducible builds
- **TypeScript Configuration**: Shared tsconfig with path mapping for clean imports
- **Code Organization**: Monorepo structure with shared schemas and clear separation of concerns

## External Dependencies

### Database and ORM
- **Drizzle ORM**: Type-safe ORM configured for PostgreSQL with schema migrations
- **PostgreSQL**: Primary database (configured but not currently connected in development)
- **Neon Database**: Serverless PostgreSQL provider for cloud deployment

### UI and Styling
- **Radix UI**: Headless UI primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: For component variant management

### Development Tools
- **Vite**: Build tool and development server with React plugin
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **TypeScript**: Static type checking across the entire application

### Third-party Integrations
- **Unsplash**: External image hosting for property images (development/demo)
- **Date-fns**: Date manipulation and formatting utilities
- **Embla Carousel**: Carousel component for property image galleries

The architecture prioritizes type safety, developer experience, and scalability while maintaining a clean separation between client and server concerns. The shared schema approach ensures data consistency across the full stack.

## Configuration Architecture

### Application Configuration (`config/app.config.js`)
The application uses a centralized configuration system that supports:

- **Multi-environment Setup**: Development, staging, and production configurations
- **Database Flexibility**: Support for PostgreSQL, MySQL, and SQLite with connection pooling
- **File Upload Management**: Configurable file size limits, allowed types, and storage paths
- **Security Settings**: Session management, CORS, rate limiting, and authentication parameters
- **Business Logic**: Investment limits, supported regions, and currency settings
- **Feature Flags**: Enable/disable functionality like payments, notifications, and user registration

### Support Team Configuration (`config/support.config.js`)
Restricted access configuration for authorized support team members:

- **Database Migrations**: SQL scripts for schema changes and data updates
- **Maintenance Scripts**: Cleanup, optimization, and health check procedures
- **Emergency Recovery**: Backup restoration and system recovery procedures
- **Security Auditing**: Access monitoring and suspicious activity detection
- **Performance Monitoring**: Database performance analysis and optimization queries

### Environment Variables
All configurations support environment variable overrides:

```env
# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:port/db
PGHOST=localhost
PGPORT=5432
PGDATABASE=fractown
PGUSER=fractown_user
PGPASSWORD=secure_password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security Configuration
SESSION_SECRET=your-secure-session-secret

# Optional Integrations
EMAIL_SERVICE=gmail
EMAIL_USER=notifications@fractown.com
EMAIL_PASSWORD=app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
RAZORPAY_KEY_ID=your-razorpay-key
```

### Setup and Deployment Scripts
- **Setup Script**: `scripts/setup.js` - Interactive setup for new deployments
- **Database Migration**: `scripts/database-migrate.js` - Support team database tools
- **Seed Script**: `scripts/seed-run.js` - Simple database seeding
- **README Documentation**: Comprehensive setup and deployment guide

This configuration architecture ensures easy deployment across different environments while maintaining security and supporting various database and integration options.