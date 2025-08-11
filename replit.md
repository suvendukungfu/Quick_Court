# QuickCourt - Sports Facility Booking Platform

## Overview

QuickCourt is a comprehensive sports facility booking platform that connects users with sports venues while providing AI-powered coaching insights. The system supports three user roles: regular users who book facilities, facility owners who manage their venues, and administrators who oversee the platform. Built with a modern full-stack architecture, the platform features a React frontend with TypeScript, Express.js backend, and PostgreSQL database with Drizzle ORM for data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: React Router DOM for client-side navigation with role-based route protection
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: Context API for authentication state and user management
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Radix UI primitives with custom styling for accessibility

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with `/api` prefix for all endpoints
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with structured error responses
- **Development**: Hot module replacement with Vite integration for seamless full-stack development

### Database & Data Layer
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for database schema management
- **Validation**: Zod schemas integrated with Drizzle for runtime type checking
- **Current Implementation**: In-memory storage implementation with interface for easy database migration

### Authentication & Authorization
- **Strategy**: Role-based access control (RBAC) with three distinct user roles
- **Session Management**: Planned integration with connect-pg-simple for PostgreSQL session storage
- **Route Protection**: Component-based route guards with automatic role-based redirects
- **User Roles**: User (booking), Facility Owner (management), Admin (platform oversight)

### Component Architecture
- **Layout System**: Role-specific layouts that adapt navigation and features based on user type
- **Shared Components**: Reusable UI components with consistent design patterns
- **Form Handling**: React Hook Form with resolver integration for validation
- **State Management**: Context providers for global state with local component state for UI interactions

## External Dependencies

### Development & Build Tools
- **Vite**: Modern build tool with TypeScript support and development server
- **esbuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

### Database & Storage
- **@neondatabase/serverless**: Serverless PostgreSQL driver for production deployment
- **Drizzle ORM**: Type-safe SQL toolkit with automatic TypeScript inference
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Lucide React**: Modern icon library with consistent design language
- **class-variance-authority**: Utility for creating component variants with Tailwind

### Data Management
- **@tanstack/react-query**: Server state management with caching and synchronization
- **date-fns**: Modern date manipulation library for booking and scheduling features
- **Zod**: Runtime type validation for API requests and responses

### Development Experience
- **TypeScript**: Static type checking across the entire application stack
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting for development
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment