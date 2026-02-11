# Annuaire Admin Implementation - Complete Guide

## Overview
The annuaire admin system allows administrators to create users with 6 different roles, and each user is automatically saved to their proper role-specific database table based on their selected role.

## Roles & Corresponding Tables
1. **Médecin (Doctor)** → `annuaire_medecin`
2. **Psychologue (Psychologist)** → `annuaire_psychologists`
3. **Laboratoire (Laboratory)** → `annuaire_laboratories`
4. **Pharmacie (Pharmacy)** → `annuaire_pharmacies`
5. **Centre Cancer (Cancer Center)** → `annuaire_cancer_centers`
6. **Association** → `annuaire_associations`

## Database Schema

### Core Tables
- **annuaire_entries**: Main entry table with user_id, role, name, email, phone, wilaya, commune, avatar_url, bio, status, metadata
- **annuaire_medecin**: Doctors with specialization, license_number, hospital_affiliation, consultation_fee, years_of_experience, education, certifications, languages_spoken, accepts_new_patients
- **annuaire_psychologists**: Psychologists with specialization, license_number, office_address, consultation_fee, years_of_experience, education, certifications, languages_spoken, accepts_new_patients, therapy_types
- **annuaire_laboratories**: Labs with lab_name, license_number, address, working_hours, test_types, accreditations, has_home_service, average_turnaround_time
- **annuaire_pharmacies**: Pharmacies with pharmacy_name, license_number, address, emergency_phone, working_hours, services, has_delivery, is_24_hours
- **annuaire_cancer_centers**: Cancer centers with center_name, registration_number, address, emergency_phone, website, departments, services, equipment, bed_capacity, has_emergency
- **annuaire_associations**: Associations with association_name, registration_number, description, address, website, focus_areas, services_offered, volunteer_opportunities, donation_info

### Key Features
- All role-specific tables have `annuaire_entry_id` foreign key to `annuaire_entries`
- RLS policies enable authenticated users to manage their own entries
- Triggers auto-update `updated_at` timestamps
- Indexes on `annuaire_entry_id` for fast lookups

## Backend Implementation

### API Endpoints

#### POST /api/admin/annuaire
Creates a new annuaire entry with role-specific data.

**Flow:**
1. Validate required fields (name, email, phone, wilaya, commune, annuaire_role)
2. Sanitize role-specific metadata based on role
3. Validate role-specific required fields
4. Create/ensure user exists in `users` table
5. Upload avatar to Supabase storage if provided
6. Insert into `annuaire_entries` table
7. Insert into role-specific table (e.g., `annuaire_medecin` for doctors)
8. Return created entry with temp password

**Key Code:**
- `ensureUserForAnnuaire()`: Creates or updates user in auth and users table
- `uploadAvatarForUser()`: Uploads avatar to Supabase storage
- `sanitizeRoleMetadata()`: Validates and sanitizes role-specific data
- `ANNULAIRE_ROLE_TABLES`: Maps roles to table names

#### PATCH /api/admin/annuaire/:id
Updates an existing annuaire entry.

**Flow:**
1. Fetch existing entry
2. Merge new data with existing data
3. Sanitize role-specific metadata
4. Update user in `users` table
5. Update avatar if provided
6. Update `annuaire_entries` record
7. Upsert into role-specific table with `onConflict: 'annuaire_entry_id'`

#### PATCH /api/admin/annuaire/:id/status
Updates entry status (pending/approved/rejected).

**Flow:**
1. Validate status value
2. Update `annuaire_entries` status
3. Update `users.is_active` based on status
4. Update/insert `user_profiles` with verification_status

#### DELETE /api/admin/annuaire/:id
Deletes an annuaire entry and all role-specific data.

**Flow:**
1. Fetch existing entry
2. Delete from role-specific table using `deleteRoleSpecificData()`
3. Delete from `annuaire_entries` table

### Helper Functions

#### sanitizeRoleMetadata(role, data)
Sanitizes and validates role-specific data:
- Converts string numbers to actual numbers
- Converts comma/newline-separated strings to arrays
- Handles JSON parsing for complex fields
- Returns empty object for unknown roles

#### validateRoleSpecificFields(role, metadata)
Validates required fields for each role:
- Médecin: specialization, license_number
- Psychologue: specialization, license_number
- Laboratoire: lab_name, license_number, address
- Pharmacie: pharmacy_name, license_number, address
- Centre Cancer: center_name, registration_number, address
- Association: association_name, registration_number, address

#### fetchAnnuaireEntryById(id)
Fetches entry and enriches with role-specific metadata from role tables.

#### deleteRoleSpecificData(role, entryId)
Deletes role-specific data from appropriate table.

## Frontend Implementation

### Form Component: AnnuaireFormDialog

**Location:** `d:/canstory/web/src/features/admin/annuaire/form-dialog.tsx`

**Features:**
- Avatar upload with compression
- Basic info fields (name, email, phone, wilaya, commune)
- Role selector dropdown
- Dynamic role-specific fields based on selected role
- Form validation with missing field detection
- Image compression to 400x400 max, JPEG quality 0.7

**Role-Specific Fields:**

**Médecin:**
- Spécialité (specialization)
- Numéro de licence (license_number)
- Affiliation hospitalière (hospital_affiliation)
- Tarif consultation (consultation_fee)
- Années d'expérience (years_of_experience)
- Langues parlées (languages_spoken)
- Formation (education)
- Certifications
- Accepte nouveaux patients (accepts_new_patients)

**Psychologue:**
- Same as Médecin + Therapy types

**Laboratoire:**
- Nom du laboratoire (lab_name)
- Numéro de licence (license_number)
- Adresse
- Horaires de travail (working_hours)
- Types de tests (test_types)
- Service à domicile (has_home_service)
- Délai moyen (average_turnaround_time)

**Pharmacie:**
- Nom de la pharmacie (pharmacy_name)
- Numéro de licence (license_number)
- Adresse
- Téléphone urgence (emergency_phone)
- Horaires de travail (working_hours)
- Livraison (has_delivery)
- 24 heures (is_24_hours)

**Centre Cancer:**
- Nom du centre (center_name)
- Numéro d'enregistrement (registration_number)
- Adresse
- Téléphone urgence (emergency_phone)
- Site web (website)
- Capacité lits (bed_capacity)

**Association:**
- Nom de l'association (association_name)
- Numéro d'enregistrement (registration_number)
- Adresse
- Description
- Site web (website)
- Domaines de focus (focus_areas)
- Services offerts (services_offered)

### Service Layer: AnnuaireService

**Location:** `d:/canstory/web/src/services/annuaire.service.ts`

**Methods:**
- `createAnnuaireEntry(payload)`: POST to `/api/admin/annuaire`
- `updateAnnuaireEntry(entryId, payload)`: PATCH to `/api/admin/annuaire/:id`
- `updateAnnuaireStatus(entryId, status)`: PATCH to `/api/admin/annuaire/:id/status`
- `deleteAnnuaireEntry(entryId)`: DELETE to `/api/admin/annuaire/:id`
- `getAnnuaireEntriesFromRoleTables()`: Fetches from all role-specific tables

## Complete Flow Example: Creating a Pharmacy

1. **Admin fills form:**
   - Name: "Pharmacie Al-Amal"
   - Email: "contact@alamal.dz"
   - Phone: "+213 555 123 456"
   - Wilaya: "16" (Alger)
   - Commune: "Algiers"
   - Role: "pharmacie"
   - Pharmacy Name: "Pharmacie Al-Amal"
   - License Number: "PH-2024-001"
   - Address: "123 Rue de la Paix, Alger"
   - Working Hours: {"monday": "09:00-20:00", ...}
   - Has Delivery: true
   - Is 24 Hours: false

2. **Frontend sends POST to `/api/admin/annuaire`:**
   ```json
   {
     "annuaire_role": "pharmacie",
     "name": "Pharmacie Al-Amal",
     "email": "contact@alamal.dz",
     "phone": "+213 555 123 456",
     "wilaya": "16",
     "commune": "Algiers",
     "avatar": { "data": "data:image/jpeg;base64...", "name": "avatar.jpg", "type": "image/jpeg" },
     "roleSpecificData": {
       "pharmacy_name": "Pharmacie Al-Amal",
       "license_number": "PH-2024-001",
       "address": "123 Rue de la Paix, Alger",
       "working_hours": {"monday": "09:00-20:00", ...},
       "has_delivery": true,
       "is_24_hours": false
     }
   }
   ```

3. **Backend processes:**
   - Creates user in auth.users and users table
   - Uploads avatar to Supabase storage
   - Inserts into annuaire_entries with status='pending'
   - Inserts into annuaire_pharmacies with all pharmacy-specific data
   - Returns created entry with temp password

4. **Database result:**
   - **annuaire_entries**: 1 row with user_id, annuaire_role='pharmacie', name, email, etc.
   - **annuaire_pharmacies**: 1 row with annuaire_entry_id, pharmacy_name, license_number, address, working_hours, has_delivery, is_24_hours

## Testing Checklist

- [ ] Create user with role "medecin" → verify data in annuaire_medecin
- [ ] Create user with role "pharmacie" → verify data in annuaire_pharmacies
- [ ] Create user with role "laboratoire" → verify data in annuaire_laboratories
- [ ] Create user with role "centre_cancer" → verify data in annuaire_cancer_centers
- [ ] Create user with role "psychologue" → verify data in annuaire_psychologists
- [ ] Create user with role "association" → verify data in annuaire_associations
- [ ] Update user → verify role-specific data updated in correct table
- [ ] Delete user → verify data deleted from both annuaire_entries and role-specific table
- [ ] Change status to "approved" → verify user.is_active = true
- [ ] Change status to "rejected" → verify user.is_active = false
- [ ] Upload avatar → verify file in Supabase storage and URL in annuaire_entries

## Key Implementation Details

### Role Mapping
```javascript
const ANNULAIRE_ROLE_TABLES = {
  medecin: { table: 'annuaire_medecin' },
  centre_cancer: { table: 'annuaire_cancer_centers' },
  psychologue: { table: 'annuaire_psychologists' },
  laboratoire: { table: 'annuaire_laboratories' },
  pharmacie: { table: 'annuaire_pharmacies' },
  association: { table: 'annuaire_associations' },
}
```

### Data Flow
1. Frontend collects all data including role-specific fields
2. Builds `roleSpecificData` object with role-specific fields
3. Sends to backend with `annuaire_role` and `roleSpecificData`
4. Backend sanitizes and validates role-specific data
5. Inserts into `annuaire_entries` (main entry)
6. Inserts into role-specific table using `ANNULAIRE_ROLE_TABLES` mapping
7. On update: upserts into role-specific table with `onConflict: 'annuaire_entry_id'`
8. On delete: deletes from role-specific table first, then from annuaire_entries

### Error Handling
- Missing required fields → 400 error with field names
- Invalid role → 400 error
- User creation failure → 400 error with auth error message
- Role-specific insert failure → 400 error, rollback annuaire_entries insert
- Database errors → 500 error with message

## Files Modified/Created

### Backend
- `d:/canstory/web/server.js`: POST/PATCH/DELETE endpoints, helper functions

### Frontend
- `d:/canstory/web/src/features/admin/annuaire/form-dialog.tsx`: Form component
- `d:/canstory/web/src/features/admin/annuaire/index.tsx`: Main page
- `d:/canstory/web/src/services/annuaire.service.ts`: API service

### Database
- `d:/canstory/database/annuaire_schema.sql`: Complete schema with all tables, indexes, triggers, RLS policies

## Notes
- All timestamps auto-update via triggers
- RLS policies allow authenticated users to manage their own entries
- Admin can create/update/delete any entry
- Avatar compression reduces file size before upload
- Working hours stored as JSONB for flexibility
- Arrays stored as TEXT[] for languages, accreditations, focus_areas
- Complex data (education, certifications, services) stored as JSONB
