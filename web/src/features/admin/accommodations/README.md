# Accommodations Module

Professional admin management system for free patient accommodations ("Logements Gratuits").

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Google Maps integration for location management
- ✅ Advanced filtering (search, wilaya, availability, status)
- ✅ Real-time stats dashboard
- ✅ Professional UI with loading states and error handling
- ✅ Admin-only access with RLS policies
- ✅ Comprehensive validation

## Components

- `index.tsx` - Main management page
- `AccommodationFormModal.tsx` - Add/Edit form with validation
- `GoogleMapsLocationPicker.tsx` - Interactive map picker
- `MapPreview.tsx` - Map preview in table
- `types.ts` - TypeScript definitions

## API Endpoints

All endpoints require admin authentication:

- `GET /api/admin/accommodations` - List with filters
- `GET /api/admin/accommodations/:id` - Get single
- `POST /api/admin/accommodations` - Create
- `PUT /api/admin/accommodations/:id` - Update
- `DELETE /api/admin/accommodations/:id` - Delete

## Setup

1. Run database migration: `database/migrations/accommodations_setup.sql`
2. Add Google Maps API key to `.env` (optional but recommended)
3. Restart server

See [GOOGLE_MAPS_SETUP.md](../../../docs/GOOGLE_MAPS_SETUP.md) for Google Maps configuration.

## Usage

Navigate to `/accommodations` in the admin dashboard.

### Creating an Accommodation

1. Click "Nouvel hébergement"
2. Fill required fields (name, wilaya, commune, address, phone, capacity)
3. Set location on map
4. Add optional details (description, amenities, rules)
5. Toggle active status
6. Click "Créer"

### Filtering

- **Search**: Type name, address, or phone
- **Wilaya**: Select from dropdown
- **Disponibilité**: Filter by Available/Full
- **Statut**: Filter by Active/Inactive

## Validation Rules

- `available_beds` must be ≤ `capacity`
- `capacity` must be ≥ 1
- `available_beds` must be ≥ 0
- Email must be valid format (if provided)
- Required fields: name, wilaya, commune, address, phone, capacity, available_beds

## Database Schema

Table: `public.accommodations`

Key fields:
- `name`, `wilaya`, `commune`, `address`
- `phone`, `email`
- `capacity`, `available_beds`
- `latitude`, `longitude`
- `is_active`
- `description`, `amenities`, `rules`
