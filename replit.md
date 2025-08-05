# fractOWN - Fractional Real Estate Investment Platform

## Overview

fractOWN is a web application that democratizes real estate investment in India by enabling users to invest in premium properties through fractional ownership. The platform allows investors to start with as little as ₹10L and benefit from property appreciation. It provides a comprehensive investment experience with property browsing, investment calculators, portfolio tracking, and contact management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (August 2025)

### Configuration Management
- **Comprehensive Configuration System**: Added `config/app.config.js` for all application settings including database, server, file uploads, authentication, and business rules
- **Support Team Configuration**: Created `config/support.config.js` with database migration scripts, maintenance tools, and emergency recovery procedures (support team access only)
- **Environment-based Configuration**: All settings are environment variable driven with fallback defaults

### Admin Dashboard Enhancements  
- **Logo Management**: Admin can upload and change application logos
- **Theme Customization**: Full theme editor with color picker for branding
- **Content Management**: Edit section descriptions and application content
- **Settings Tab**: Comprehensive settings interface with branding, theme, content, system, and database configuration
- **Scrollable Forms**: Property creation/edit dialogs are now scrollable and responsive for all screen sizes

### Database Configuration
- **Multi-database Support**: Configurable for PostgreSQL (primary), MySQL, or SQLite  
- **Connection Pooling**: Configured database connection pool settings
- **Migration Support**: Database migration scripts for schema changes (support team only)
- **Backup Procedures**: Automated backup and restore capabilities

### File Upload System
- **Configurable File Limits**: Max file size, allowed types, and upload paths are configurable
- **Multiple File Support**: Support for images and documents with type validation
- **Upload Directory Management**: Automatic directory creation and permission handling

### Security Enhancements
- **Session Management**: Configurable session secrets and timeout settings
- **Rate Limiting**: Built-in rate limiting configuration
- **Access Controls**: Support team folder with restricted access
- **Authentication**: Enhanced bcrypt configuration with configurable rounds

### Development & Deployment
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