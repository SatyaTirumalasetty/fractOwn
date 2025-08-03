# fractOWN - Fractional Real Estate Investment Platform

## Overview

fractOWN is a web application that democratizes real estate investment in India by enabling users to invest in premium properties through fractional ownership. The platform allows investors to start with as little as ₹10L and benefit from property appreciation. It provides a comprehensive investment experience with property browsing, investment calculators, portfolio tracking, and contact management.

## User Preferences

Preferred communication style: Simple, everyday language.

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