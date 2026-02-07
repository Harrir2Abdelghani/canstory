# Canstory

A professional e-health platform focused on cancer awareness and medical information.

## Project Structure

This project consists of three main components:

1. **Public Landing Website** - Next.js application serving as the public-facing website
2. **Admin Dashboard** - Secure Next.js application for administrative functions
3. **Mobile App** - React Native with Expo for iOS and Android

## Technology Stack

- **Frontend (Web)**: Next.js (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Mobile**: React Native with Expo (TypeScript)
- **State Management**: Context API and/or Zustand
- **Authentication**: Supabase Auth with JWT

## Development Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Expo CLI for mobile development

### Environment Variables

Each project component has its own environment configuration. See the respective README files in each directory.

## Architecture Overview

This project follows a monorepo structure:

- `web/` - Contains both the landing website and admin dashboard
- `mobile/` - Contains the React Native mobile application
- `packages/` - Shared libraries, types, and utilities

## Security Considerations

- Environment separation for development, testing and production
- Role-based access for the admin dashboard
- JWT-based authentication
- Supabase Row-Level Security (RLS)
