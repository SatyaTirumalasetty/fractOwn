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

### Third-party Integrations
- **Unsplash**: External image hosting (development/demo).
- **Date-fns**: Date manipulation and formatting utilities.
- **Embla Carousel**: Carousel component.