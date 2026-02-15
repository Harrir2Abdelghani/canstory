# CanStory API Server

Express.js API server for the CanStory application, providing backend services for admin operations, authentication, and data management.

## Features

- **Admin Management**: Annuaire, doctors, and users CRUD operations
- **Authentication**: Sign-in, sign-out, password management
- **Location Data**: Wilayas and communes endpoints
- **Supabase Integration**: Database and authentication via Supabase

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (admin access)
- `API_PORT`: Port for the API server (default: 3001)
- `FRONTEND_URL`: URL of the frontend application (for CORS)
- `NODE_ENV`: Environment (development/production)

### 3. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in `API_PORT`).

## API Endpoints

### Authentication
- `POST /api/auth/sign-in` - User sign-in
- `POST /api/auth/sign-out` - User sign-out
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Admin - Annuaire
- `GET /api/admin/annuaire` - List annuaire entries
- `POST /api/admin/annuaire` - Create annuaire entry
- `PATCH /api/admin/annuaire/:id` - Update annuaire entry
- `PATCH /api/admin/annuaire/:id/status` - Update annuaire status
- `DELETE /api/admin/annuaire/:id` - Delete annuaire entry

### Admin - Doctors
- `GET /api/admin/doctors` - List doctors
- `POST /api/admin/doctors` - Create doctor
- `PATCH /api/admin/doctors/:id` - Update doctor
- `PATCH /api/admin/doctors/:id/status` - Update doctor status
- `DELETE /api/admin/doctors/:id` - Delete doctor

### Admin - Users
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Location Data
- `GET /api/wilayas` - Get all wilayas
- `GET /api/communes?wilaya_id=:id` - Get communes by wilaya

### Debug
- `GET /api/admin/debug` - Debug endpoint for database inspection

## CORS Configuration

The server is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `https://canstory-frontend.onrender.com`
- `https://canstory.netlify.app`
- Custom URL from `FRONTEND_URL` environment variable

## Authentication

Admin endpoints require authentication via:
1. HttpOnly cookie (`canstory_session`)
2. Authorization Bearer header

Admin roles: `admin`, `superadmin`

## Development

The server uses:
- **Express.js**: Web framework
- **Supabase**: Database and authentication
- **CORS**: Cross-origin resource sharing
- **Cookie Parser**: Cookie handling
- **dotenv**: Environment variable management
