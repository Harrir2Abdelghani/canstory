# Canstory Project Architecture Documentation

This document outlines the key architectural decisions, patterns, and considerations for the Canstory e-health platform focused on cancer awareness and medical information.

## Project Overview

Canstory consists of three main components:

1. **Public Landing Website** - Informational content for visitors
2. **Admin Dashboard** - Content management system for administrators
3. **Mobile App** - iOS & Android application for users

## Technology Stack

### Frontend (Web)

- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Context API (for smaller components), Zustand (for more complex state)

### Backend

- **Platform**: Supabase
- **Database**: PostgreSQL (provided by Supabase)
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage
- **Security**: Row Level Security (RLS) policies

### Mobile

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Context API and Zustand

## Project Structure

```
canstory/
├── web/                  # Next.js web application (landing & admin)
│   ├── app/              # App Router-based application
│   │   ├── (landing)/    # Public landing website routes
│   │   └── (admin)/      # Admin dashboard routes (auth-protected)
│   ├── components/       # Shared UI components
│   ├── lib/              # Utility functions and shared libraries
│   │   └── supabase.ts   # Supabase client configuration
│   └── shared/           # Shared types, constants, etc.
│
├── mobile/               # React Native mobile application
│   ├── src/
│   │   ├── assets/       # Images, fonts, etc.
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and libraries
│   │   │   └── supabase.ts # Supabase client for mobile
│   │   ├── navigation/   # Navigation configuration
│   │   ├── screens/      # Screen components
│   │   └── utils/        # Helper functions
│   └── app.json         # Expo configuration
│
└── packages/            # (Future) Shared packages for cross-platform use
```

## Key Architectural Decisions

### 1. Monorepo Structure

We chose a monorepo structure to allow for:
- Shared types between web and mobile
- Easier code sharing and reuse
- Centralized management of dependencies
- Simplified CI/CD workflows

### 2. Next.js App Router

The Next.js App Router provides:
- File-based routing
- Built-in SSR and SSG capabilities for SEO optimization
- Route groups for logical separation of admin and landing site
- API routes for server-side operations

### 3. Route Separation

We've separated routes using Next.js route groups:
- `(landing)` - Public-facing website routes
- `(admin)` - Protected admin dashboard routes

This ensures clear separation of concerns and allows for different layouts and middleware.

### 4. Authentication & Authorization

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (admin only for now)
- **Middleware**: Next.js middleware for route protection
- **Session Management**: Client-side session handling with Supabase

### 5. Mobile Navigation

- Bottom tab navigation for primary app sections
- Stack navigation within each tab for detail views
- Consistent navigation patterns across iOS and Android

### 6. State Management

- **React Context**: For component-level state sharing
- **Zustand**: For application-wide state management
- No Redux to keep dependencies minimal and reduce boilerplate

### 7. Styling Approach

- **Web**: Tailwind CSS for utility-first styling
- **Mobile**: React Native StyleSheet with consistent naming conventions

### 8. Data Fetching

- **Web**: Server Components for data fetching where possible
- **Mobile**: Custom hooks for data fetching and state management
- **Both**: Supabase client for consistent data access patterns

## Security Considerations

- Environment variables for sensitive configuration
- JWT token authentication with secure storage
- HTTP-only cookies for web authentication
- SecureStore for mobile token storage
- Row Level Security (RLS) policies on Supabase
- Role-based access control for admin features
- CORS policy configuration
- Content Security Policy implementation

## Scalability Considerations

- Code splitting for optimized bundle sizes
- Lazy loading of components and routes
- Efficient data caching strategies
- Optimized image loading and processing
- Serverless architecture via Supabase
- Horizontal scaling capabilities

## Future Considerations

- **GraphQL**: Potential implementation for more efficient data fetching
- **Shared UI Library**: Development of a shared component library
- **Internationalization**: Support for multiple languages
- **Offline Support**: Enhanced offline capabilities for mobile
- **PWA**: Progressive Web App features for the web application
- **Micro-frontend Architecture**: For larger team scaling

---

This architecture is designed to provide a clean, maintainable foundation that can scale with the application's growth while maintaining high performance and security standards.
