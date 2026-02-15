import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.API_PORT || 3001
const SESSION_COOKIE_NAME = 'canstory_session'
const ADMIN_ROLES = ['admin', 'superadmin']

app.use(cors({
  origin: true, // Allow all origins for mobile development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const mapDoctorResponse = (doctorRow, userRow, profileRow) => {
  const consultationFee = doctorRow?.consultation_fee !== null && doctorRow?.consultation_fee !== undefined
    ? Number(doctorRow.consultation_fee)
    : null

  return {
    id: doctorRow?.id || null,
    userId: doctorRow?.user_id || userRow?.id || null,
    name: userRow?.full_name || '',
    email: userRow?.email || '',
    phone: userRow?.phone || '',
    wilaya: userRow?.wilaya || '',
    commune: userRow?.commune || '',
    avatarUrl: userRow?.avatar_url || null,
    bio: profileRow?.bio || null,
    specialization: doctorRow?.specialization || profileRow?.specialization || '',
    licenseNumber: doctorRow?.license_number || profileRow?.license_number || '',
    hospitalAffiliation: doctorRow?.hospital_affiliation || null,
    consultationFee,
    yearsOfExperience: doctorRow?.years_of_experience ?? null,
    education: Array.isArray(doctorRow?.education) ? doctorRow.education : null,
    certifications: Array.isArray(doctorRow?.certifications) ? doctorRow.certifications : null,
    languagesSpoken: Array.isArray(doctorRow?.languages_spoken) ? doctorRow.languages_spoken : null,
    acceptsNewPatients: doctorRow?.accepts_new_patients ?? true,
    status: profileRow?.verification_status || (userRow?.is_active ? 'approved' : 'pending'),
    registrationDate: userRow?.created_at || doctorRow?.created_at || null,
    createdAt: doctorRow?.created_at || null,
    updatedAt: doctorRow?.updated_at || null,
  }
}

const normalizeStringArray = (value) => {
  if (!value) return null
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter((item) => Boolean(item))
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return null
}

const ANNULAIRE_ROLE_TO_USER_ROLE = {
  medecin: 'doctor',
  psychologue: 'doctor',
  centre_cancer: 'cancer_center',
  laboratoire: 'laboratory',
  pharmacie: 'pharmacy',
  association: 'association',
}

const mapAnnuaireRoleToUserRole = (role) => ANNULAIRE_ROLE_TO_USER_ROLE[role] || 'doctor'

const parseWorkingHoursPayload = (value) => {
  if (value === undefined || value === null) return {}
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return {}
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object') return parsed
    } catch (_) {
      return { description: trimmed }
    }
  }
  return {}
}

const toStringArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean)
  }
  const normalized = normalizeStringArray(value)
  if (normalized) return normalized
  const parsed = parseJsonList(value)
  if (Array.isArray(parsed)) return parsed
  return []
}

const toJsonOrNull = (value) => {
  if (value === undefined || value === null) return null
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    try {
      return JSON.parse(trimmed)
    } catch (_) {
      return trimmed
    }
  }
  return value
}

const booleanFromInput = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase()
    if (!lower) return defaultValue
    return ['true', '1', 'yes', 'oui'].includes(lower)
  }
  return defaultValue
}

const ANNULAIRE_ROLE_TABLES = {
  medecin: { table: 'annuaire_medecin' },
  centre_cancer: { table: 'annuaire_cancer_centers' },
  psychologue: { table: 'annuaire_psychologists' },
  laboratoire: { table: 'annuaire_laboratories' },
  pharmacie: { table: 'annuaire_pharmacies' },
  association: { table: 'annuaire_associations' },
}

const sanitizeRoleMetadata = (role, data = {}) => {
  if (!role) return {}
  const payload = data || {}

  const toNumberOrNull = (value) => {
    const parsed = parseNumeric(value)
    return parsed === null ? null : parsed
  }

  switch (role) {
    case 'medecin':
      return {
        specialization: payload.specialization || '',
        license_number: payload.license_number || payload.licenseNumber || '',
        hospital_affiliation: payload.hospital_affiliation || payload.hospitalAffiliation || null,
        consultation_fee: toNumberOrNull(payload.consultation_fee ?? payload.consultationFee),
        years_of_experience: payload.years_of_experience !== undefined
          ? Number(payload.years_of_experience) || null
          : payload.yearsOfExperience !== undefined
            ? Number(payload.yearsOfExperience) || null
            : null,
        education: toStringArray(payload.education),
        certifications: toStringArray(payload.certifications),
        languages_spoken: toStringArray(payload.languages_spoken ?? payload.languagesSpoken),
        accepts_new_patients: booleanFromInput(payload.accepts_new_patients ?? payload.acceptsNewPatients, true),
      }
    case 'centre_cancer':
      return {
        center_name: payload.center_name || payload.centerName || '',
        registration_number: payload.registration_number || payload.registrationNumber || '',
        address: payload.address || '',
        emergency_phone: payload.emergency_phone || payload.emergencyPhone || null,
        website: payload.website || null,
        bed_capacity: payload.bed_capacity !== undefined
          ? Number(payload.bed_capacity) || null
          : payload.bedCapacity !== undefined
            ? Number(payload.bedCapacity) || null
            : null,
        departments: toJsonOrNull(payload.departments),
        services: toJsonOrNull(payload.services),
        equipment: toJsonOrNull(payload.equipment),
      }
    case 'psychologue':
      return {
        specialization: payload.specialization || '',
        license_number: payload.license_number || payload.licenseNumber || '',
        office_address: payload.office_address || payload.officeAddress || null,
        consultation_fee: toNumberOrNull(payload.consultation_fee ?? payload.consultationFee),
        years_of_experience: payload.years_of_experience !== undefined
          ? Number(payload.years_of_experience) || null
          : payload.yearsOfExperience !== undefined
            ? Number(payload.yearsOfExperience) || null
            : null,
        education: toStringArray(payload.education),
        certifications: toStringArray(payload.certifications),
        languages_spoken: toStringArray(payload.languages_spoken ?? payload.languagesSpoken),
        accepts_new_patients: booleanFromInput(payload.accepts_new_patients ?? payload.acceptsNewPatients, true),
        therapy_types: toStringArray(payload.therapy_types ?? payload.therapyTypes),
      }
    case 'laboratoire':
      return {
        lab_name: payload.lab_name || payload.labName || '',
        license_number: payload.license_number || payload.registration_number || payload.registrationNumber || '',
        address: payload.address || '',
        working_hours: parseWorkingHoursPayload(payload.working_hours ?? payload.workingHours),
        test_types: toStringArray(payload.test_types ?? payload.testTypes),
        accreditations: toStringArray(payload.accreditations),
        has_home_service: booleanFromInput(payload.has_home_service ?? payload.hasHomeService, false),
        average_turnaround_time: toNumberOrNull(payload.average_turnaround_time ?? payload.turnaroundTime),
      }
    case 'pharmacie':
      return {
        pharmacy_name: payload.pharmacy_name || payload.pharmacyName || '',
        license_number: payload.license_number || payload.registration_number || payload.registrationNumber || '',
        address: payload.address || '',
        emergency_phone: payload.emergency_phone || payload.emergencyPhone || null,
        working_hours: parseWorkingHoursPayload(payload.working_hours ?? payload.workingHours),
        services: toJsonOrNull(payload.services ?? payload.services_offered),
        has_delivery: booleanFromInput(payload.has_delivery ?? payload.hasDelivery, false),
        is_24_hours: booleanFromInput(payload.is_24_hours ?? payload.is24Hours, false),
      }
    case 'association':
      return {
        association_name: payload.association_name || payload.associationName || '',
        registration_number: payload.registration_number || payload.registrationNumber || '',
        address: payload.address || '',
        website: payload.website || null,
        description: payload.description || null,
        focus_areas: toStringArray(payload.focus_areas ?? payload.focusAreas),
        services_offered: toJsonOrNull(payload.services_offered ?? payload.servicesOffered),
        volunteer_opportunities: toJsonOrNull(payload.volunteer_opportunities),
        donation_info: toJsonOrNull(payload.donation_info),
      }
    default:
      return {}
  }
}

const buildRoleMetadataFromRow = (role, row) => {
  if (!role || !row) return {}
  switch (role) {
    case 'medecin':
      return {
        specialization: row.specialization || '',
        license_number: row.license_number || '',
        hospital_affiliation: row.hospital_affiliation || null,
        consultation_fee: row.consultation_fee,
        years_of_experience: row.years_of_experience,
        education: Array.isArray(row.education)
          ? row.education
          : typeof row.education === 'string'
            ? [row.education]
            : row.education || [],
        certifications: Array.isArray(row.certifications)
          ? row.certifications
          : typeof row.certifications === 'string'
            ? [row.certifications]
            : row.certifications || [],
        languages_spoken: Array.isArray(row.languages_spoken) ? row.languages_spoken : [],
        accepts_new_patients: row.accepts_new_patients ?? true,
      }
    case 'centre_cancer':
      return {
        center_name: row.center_name || '',
        registration_number: row.registration_number || '',
        address: row.address || '',
        emergency_phone: row.emergency_phone || null,
        website: row.website || null,
        bed_capacity: row.bed_capacity,
        departments: row.departments || null,
        services: row.services || null,
        equipment: row.equipment || null,
      }
    case 'psychologue':
      return {
        specialization: row.specialization || '',
        license_number: row.license_number || '',
        office_address: row.office_address || null,
        consultation_fee: row.consultation_fee,
        years_of_experience: row.years_of_experience,
        education: Array.isArray(row.education)
          ? row.education
          : typeof row.education === 'string'
            ? [row.education]
            : row.education || [],
        certifications: Array.isArray(row.certifications)
          ? row.certifications
          : typeof row.certifications === 'string'
            ? [row.certifications]
            : row.certifications || [],
        languages_spoken: Array.isArray(row.languages_spoken) ? row.languages_spoken : [],
        accepts_new_patients: row.accepts_new_patients ?? true,
        therapy_types: Array.isArray(row.therapy_types)
          ? row.therapy_types
          : typeof row.therapy_types === 'string'
            ? [row.therapy_types]
            : row.therapy_types || [],
      }
    case 'laboratoire':
      return {
        lab_name: row.lab_name || '',
        license_number: row.license_number || '',
        address: row.address || '',
        working_hours: row.working_hours || {},
        test_types: Array.isArray(row.test_types)
          ? row.test_types
          : typeof row.test_types === 'string'
            ? [row.test_types]
            : row.test_types || [],
        accreditations: Array.isArray(row.accreditations) ? row.accreditations : [],
        has_home_service: row.has_home_service ?? false,
        average_turnaround_time: row.average_turnaround_time,
      }
    case 'pharmacie':
      return {
        pharmacy_name: row.pharmacy_name || '',
        license_number: row.license_number || '',
        address: row.address || '',
        emergency_phone: row.emergency_phone || null,
        working_hours: row.working_hours || {},
        services: row.services || null,
        has_delivery: row.has_delivery ?? false,
        is_24_hours: row.is_24_hours ?? false,
      }
    case 'association':
      return {
        association_name: row.association_name || '',
        registration_number: row.registration_number || '',
        address: row.address || '',
        website: row.website || null,
        description: row.description || null,
        focus_areas: Array.isArray(row.focus_areas)
          ? row.focus_areas
          : typeof row.focus_areas === 'string'
            ? [row.focus_areas]
            : row.focus_areas || [],
        services_offered: row.services_offered || null,
        volunteer_opportunities: row.volunteer_opportunities || null,
        donation_info: row.donation_info || null,
      }
    default:
      return {}
  }
}

const fetchRoleMetadataForEntries = async (entries) => {
  const roleMaps = new Map()

  await Promise.all(
    Object.entries(ANNULAIRE_ROLE_TABLES).map(async ([role, { table }]) => {
      const entryIds = entries.filter((entry) => entry.annuaire_role === role).map((entry) => entry.id)
      if (!entryIds.length) {
        roleMaps.set(role, new Map())
        return
      }

      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .in('annuaire_entry_id', entryIds)

      if (error) {
        console.error(`Fetch role metadata error for ${role}:`, error)
        roleMaps.set(role, new Map())
        return
      }

      const map = new Map()
      for (const row of data || []) {
        map.set(row.annuaire_entry_id, buildRoleMetadataFromRow(role, row))
      }
      roleMaps.set(role, map)
    })
  )

  return roleMaps
}

const enrichAnnuaireEntries = async (entries) => {
  if (!entries || !entries.length) return []

  const roleMaps = await fetchRoleMetadataForEntries(entries)

  return entries.map((entry) => {
    const roleMap = roleMaps.get(entry.annuaire_role) || new Map()
    const roleMetadata = roleMap.get(entry.id) || {}
    const entryMetadata = typeof entry.metadata === 'object' && entry.metadata !== null ? entry.metadata : {}

    return {
      ...entry,
      metadata: {
        ...roleMetadata,
        ...entryMetadata,
      },
    }
  })
}

const validateRoleSpecificFields = (role, metadata) => {
  const missing = []
  switch (role) {
    case 'medecin':
      if (!metadata.specialization) missing.push('Spécialité')
      if (!metadata.license_number) missing.push('Numéro de licence')
      break
    case 'centre_cancer':
      if (!metadata.center_name) missing.push('Nom du centre')
      if (!metadata.registration_number) missing.push("Numéro d'enregistrement")
      if (!metadata.address) missing.push('Adresse')
      break
    case 'psychologue':
      if (!metadata.specialization) missing.push('Spécialité')
      if (!metadata.license_number) missing.push('Numéro de licence')
      break
    case 'laboratoire':
      if (!metadata.lab_name) missing.push('Nom du laboratoire')
      if (!metadata.license_number) missing.push('Numéro de licence')
      if (!metadata.address) missing.push('Adresse')
      break
    case 'pharmacie':
      if (!metadata.pharmacy_name) missing.push('Nom de la pharmacie')
      if (!metadata.license_number) missing.push('Numéro de licence')
      if (!metadata.address) missing.push('Adresse')
      break
    case 'association':
      if (!metadata.association_name) missing.push("Nom de l'association")
      if (!metadata.registration_number) missing.push("Numéro d'enregistrement")
      if (!metadata.address) missing.push('Adresse')
      break
    default:
      break
  }
  return missing
}

const uploadAvatarForUser = async (userId, avatarPayload) => {
  if (!avatarPayload || !avatarPayload.data || !avatarPayload.name) {
    return null
  }

  try {
    const base64Data = typeof avatarPayload.data === 'string' ? avatarPayload.data.split(',').pop() : undefined
    if (!base64Data) {
      throw new Error('Invalid avatar payload')
    }

    const fileBuffer = Buffer.from(base64Data, 'base64')
    const extensionFromType = typeof avatarPayload.type === 'string' ? avatarPayload.type.split('/').pop() : undefined
    const extensionFromName = typeof avatarPayload.name === 'string' ? avatarPayload.name.split('.').pop() : undefined
    const fileExtension = (extensionFromType || extensionFromName || 'jpg').toLowerCase()
    const sanitizedName = typeof avatarPayload.name === 'string' ? avatarPayload.name.replace(/[^a-zA-Z0-9-_.]/g, '-') : 'avatar'
    const hasExtension = sanitizedName.toLowerCase().endsWith(`.${fileExtension}`)
    const finalName = hasExtension ? sanitizedName : `${sanitizedName}.${fileExtension}`
    const storagePath = `${userId}/${Date.now()}-${finalName}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(storagePath, fileBuffer, {
        contentType: avatarPayload.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(storagePath)
    return publicUrlData?.publicUrl || null
  } catch (error) {
    console.error('Annuaire avatar upload error:', error)
    return null
  }
}

const ensureUserForAnnuaire = async ({ annuaireRole, name, email, phone, wilaya, commune, bio, avatar, password, metadata }) => {
  const normalizedUserRole = mapAnnuaireRoleToUserRole(annuaireRole)

  const { data: existingUser, error: existingUserError } = await supabaseAdmin
    .from('users')
    .select('id,email,role,avatar_url')
    .eq('email', email)
    .maybeSingle()

  if (existingUserError) {
    return { error: existingUserError }
  }

  let userId
  let tempPassword = null
  let avatarUrl = existingUser?.avatar_url || null

  if (!existingUser) {
    const userPassword = password || crypto.randomBytes(12).toString('base64url')
    const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (authError || !authResult?.user) {
      console.error('Create annuaire auth user error:', authError)
      return { error: authError || new Error('Failed to create auth user') }
    }

    userId = authResult.user.id
    tempPassword = password || null

    const userInsertPayload = {
      id: userId,
      email,
      full_name: name,
      role: normalizedUserRole,
      phone: phone || null,
      wilaya: wilaya || null,
      commune: commune || null,
      language: 'fr',
      avatar_url: null,
      is_active: false,
      email_verified: false,
    }

    const { error: userInsertError } = await supabaseAdmin.from('users').insert(userInsertPayload)
    if (userInsertError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.error('Insert annuaire user profile error:', userInsertError)
      return { error: userInsertError }
    }
  } else {
    userId = existingUser.id
    const updatePayload = {
      full_name: name,
      phone: phone || null,
      wilaya: wilaya || null,
      commune: commune || null,
    }

    if (existingUser.role !== normalizedUserRole && normalizedUserRole) {
      updatePayload.role = normalizedUserRole
    }

    const { error: userUpdateError } = await supabaseAdmin.from('users').update(updatePayload).eq('id', userId)
    if (userUpdateError) {
      return { error: userUpdateError }
    }
  }

  if (avatar && avatar.data && avatar.name) {
    const uploadedUrl = await uploadAvatarForUser(userId, avatar)
    if (uploadedUrl) {
      avatarUrl = uploadedUrl
      await supabaseAdmin.from('users').update({ avatar_url: avatarUrl }).eq('id', userId)
    }
  }

  const profilePayload = {
    user_id: userId,
    bio: bio || null,
    specialization: metadata?.specialization || null,
    license_number: metadata?.license_number || null,
    address: metadata?.address || null,
    working_hours: metadata?.working_hours || null,
    services: metadata?.services || null,
    website: metadata?.website || null,
    metadata: metadata || {},
    updated_at: new Date().toISOString(),
  }

  const { error: profileUpsertError } = await supabaseAdmin
    .from('user_profiles')
    .upsert(profilePayload, { onConflict: 'user_id' })

  if (profileUpsertError) {
    console.error('Upsert annuaire user profile error:', profileUpsertError)
    return { error: profileUpsertError }
  }

  return { userId, tempPassword, avatarUrl }
}

const fetchAnnuaireEntryById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('annuaire_entries')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return { error }
  }

  if (!data) {
    return { data: null }
  }

  const enriched = await enrichAnnuaireEntries([data])
  return { data: enriched[0] || null }
}

const deleteRoleSpecificData = async (role, entryId) => {
  const roleTableInfo = ANNULAIRE_ROLE_TABLES[role]
  if (!roleTableInfo?.table) return { error: null }

  const { error } = await supabaseAdmin
    .from(roleTableInfo.table)
    .delete()
    .eq('annuaire_entry_id', entryId)

  return { error }
}

const buildAnnuaireResponse = (entry, user) => {
  if (!entry) return null
  const userData = user || {}

  return {
    ...entry,
    avatar_url: entry.avatar_url || userData.avatar_url || null,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
  }
}

/**
 * Validates JWT and enforces admin role.
 * Token can come from: 1) HttpOnly cookie, 2) Authorization Bearer header.
 * Returns admin user object or null (sends 401/403 and returns null).
 */
const requireAdminAuth = async (req, res) => {
  console.log('[requireAdminAuth] === DEBUG START ===')
  console.log('[requireAdminAuth] Cookies:', req.cookies)
  console.log('[requireAdminAuth] SESSION_COOKIE_NAME:', SESSION_COOKIE_NAME)
  console.log('[requireAdminAuth] Authorization header:', req.headers.authorization)
  
  const token = req.cookies?.[SESSION_COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, '').trim()
  console.log('[requireAdminAuth] Extracted token:', token ? `${token.substring(0, 50)}...` : 'NO TOKEN')
  
  if (!token) {
    console.log('[requireAdminAuth] ❌ NO TOKEN FOUND')
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
    console.log('[requireAdminAuth] ❌ SUPABASE NOT CONFIGURED')
    res.status(500).json({ error: 'Service role key not configured' })
    return null
  }

  try {
    console.log('[requireAdminAuth] Validating token with Supabase...')
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    console.log('[requireAdminAuth] Supabase response - User:', authUser?.id, 'Error:', authError?.message)
    
    if (authError || !authUser) {
      console.log('[requireAdminAuth] ❌ INVALID TOKEN')
      res.status(401).json({ error: 'Invalid or expired session' })
      return null
    }

    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id,email,full_name,role,is_active,phone,wilaya,commune')
      .eq('id', authUser.id)
      .single()

    if (dbError || !dbUser) {
      res.status(401).json({ error: 'User profile not found' })
      return null
    }

    if (!dbUser.is_active) {
      res.status(403).json({ error: 'Account is inactive' })
      return null
    }

    const role = (dbUser.role || '').toLowerCase()
    console.log('[requireAdminAuth] User role:', role, 'ADMIN_ROLES:', ADMIN_ROLES, 'Includes?:', ADMIN_ROLES.includes(role))
    console.log('[requireAdminAuth] Full dbUser:', JSON.stringify(dbUser, null, 2))
    
    if (!ADMIN_ROLES.includes(role)) {
      console.log('[requireAdminAuth] ❌ NOT AN ADMIN - role:', role)
      res.status(403).json({ error: 'Admin access required' })
      return null
    }
    
    console.log('[requireAdminAuth] ✅ AUTH SUCCESS - User:', dbUser.email, 'Role:', role)
    return dbUser
  } catch (err) {
    console.error('[requireAdminAuth]', err)
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
}

// Debug endpoint to check database data
app.get('/api/admin/debug', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    console.log('Debug endpoint called')
    
    // Get all users
    const { data: allUsers, error: usersError, count: usersCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
    
    console.log('All users:', allUsers?.length || 0, 'Error:', usersError)
    
    // Get all annuaire entries
    const { data: allAnnuaire, error: annuaireError, count: annuaireCount } = await supabaseAdmin
      .from('annuaire_entries')
      .select('*', { count: 'exact' })
    
    console.log('All annuaire:', allAnnuaire?.length || 0, 'Error:', annuaireError)
    
    // Test serialization
    const testUsers = (allUsers || []).slice(0, 1).map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
    }))
    
    const testAnnuaire = (allAnnuaire || []).slice(0, 1).map(a => ({
      id: a.id,
      name: a.name,
      email: a.email,
    }))
    
    console.log('Test serialization:', {
      users: testUsers,
      annuaire: testAnnuaire,
    })
    
    return res.status(200).json({
      users: { 
        count: usersCount || allUsers?.length || 0, 
        error: usersError?.message || null, 
        samples: testUsers
      },
      annuaire: { 
        count: annuaireCount || allAnnuaire?.length || 0, 
        error: annuaireError?.message || null, 
        samples: testAnnuaire
      },
    })
  } catch (error) {
    console.error('Debug error:', error)
    return res.status(500).json({ error: error.message })
  }
})

app.get('/api/admin/annuaire', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { search = '', role, status, wilaya } = req.query

    console.log('Fetching annuaire with params:', { search, role, status, wilaya })

    let query = supabaseAdmin.from('annuaire_entries').select('*').order('created_at', { ascending: false })

    if (role && typeof role === 'string' && role.trim()) {
      query = query.eq('annuaire_role', role.trim())
    }

    if (status && typeof status === 'string' && status.trim()) {
      query = query.eq('status', status.trim())
    }

    if (wilaya && typeof wilaya === 'string' && wilaya.trim()) {
      query = query.eq('wilaya', wilaya.trim())
    }

    const { data: entriesData, error: entriesError } = await query

    if (entriesError) {
      console.error('Fetch annuaire entries error:', entriesError)
      return res.status(500).json({ error: 'Failed to retrieve annuaire entries', details: entriesError.message })
    }

    console.log('Annuaire entries fetched:', entriesData?.length || 0, 'entries')
    if (entriesData && entriesData.length > 0) {
      console.log('Sample entry:', entriesData[0])
    }

    let entries = entriesData || []

    if (search && typeof search === 'string' && search.trim()) {
      const normalizedSearch = search.trim().toLowerCase()
      entries = entries.filter((entry) => {
        return [entry.name, entry.email, entry.wilaya, entry.commune]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch))
      })
    }

    const enriched = await enrichAnnuaireEntries(entries)
    
    // Ensure all entries have correct status - if status is missing or invalid, default to pending
    const validatedEntries = enriched.map(entry => ({
      ...entry,
      status: entry.status && ['pending', 'approved', 'rejected'].includes(entry.status) ? entry.status : 'pending'
    }))
    
    const userIds = Array.from(new Set(validatedEntries.map((entry) => entry.user_id).filter(Boolean)))

    let userMap = new Map()
    if (userIds.length) {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id,avatar_url,created_at,updated_at')
        .in('id', userIds)

      if (usersError) {
        console.error('Fetch annuaire users error:', usersError)
      } else {
        userMap = new Map((usersData || []).map((user) => [user.id, user]))
      }
    }

    const responseData = validatedEntries.map((entry) => buildAnnuaireResponse(entry, userMap.get(entry.user_id))).filter(Boolean)

    console.log('Returning annuaire response:', responseData?.length || 0, 'entries')
    if (responseData.length > 0) {
      console.log('First entry response:', {
        id: responseData[0].id,
        name: responseData[0].name,
        status: responseData[0].status,
        statusType: typeof responseData[0].status
      })
    }
    
    // Create clean response object
    const cleanData = responseData.map(entry => ({
      id: entry.id,
      user_id: entry.user_id,
      annuaire_role: entry.annuaire_role,
      name: entry.name,
      email: entry.email,
      phone: entry.phone || null,
      wilaya: entry.wilaya || null,
      commune: entry.commune || null,
      avatar_url: entry.avatar_url || null,
      bio: entry.bio || null,
      status: entry.status || 'pending',
      metadata: entry.metadata || {},
      created_at: entry.created_at || null,
      updated_at: entry.updated_at || null,
    }))
    
    const responseBody = JSON.stringify({ data: cleanData })
    console.log('Response body length:', responseBody.length)
    console.log('Response body preview:', responseBody.substring(0, 300))
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Length', responseBody.length)
    res.status(200).send(responseBody)
  } catch (error) {
    console.error('Annuaire list error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

app.post('/api/admin/annuaire', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const {
      annuaire_role,
      name,
      email,
      phone,
      wilaya,
      commune,
      bio,
      avatar,
      password,
      roleSpecificData = {},
    } = req.body || {}

    if (!annuaire_role || !name || !email || !wilaya || !commune || !phone) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' })
    }

    const normalizedRole = annuaire_role.trim()
    const sanitizedMetadata = sanitizeRoleMetadata(normalizedRole, roleSpecificData)
    const missingRoleFields = validateRoleSpecificFields(normalizedRole, sanitizedMetadata)
    if (missingRoleFields.length) {
      return res.status(400).json({ error: `Champs requis manquants: ${missingRoleFields.join(', ')}` })
    }

    const ensureResult = await ensureUserForAnnuaire({
      annuaireRole: normalizedRole,
      name: name.trim(),
      email: email.trim(),
      phone: phone || null,
      wilaya: wilaya || null,
      commune: commune || null,
      bio: bio || null,
      avatar,
      password: password.trim(),
      metadata: sanitizedMetadata,
    })

    if (ensureResult.error) {
      console.error('Ensure annuaire user error:', ensureResult.error)
      return res.status(400).json({ error: ensureResult.error.message || 'Failed to ensure user' })
    }

    const { userId, tempPassword, avatarUrl } = ensureResult

    const { data: existingEntry, error: existingEntryError } = await supabaseAdmin
      .from('annuaire_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('annuaire_role', normalizedRole)
      .maybeSingle()

    if (existingEntryError) {
      console.error('Check annuaire entry error:', existingEntryError)
      return res.status(500).json({ error: "Impossible de vérifier l'entrée existante" })
    }

    if (existingEntry) {
      return res.status(409).json({ error: 'Une entrée pour ce rôle existe déjà' })
    }

    const entryPayload = {
      user_id: userId,
      annuaire_role: normalizedRole,
      name: name.trim(),
      email: email.trim(),
      phone: phone || null,
      wilaya: wilaya || null,
      commune: commune || null,
      avatar_url: avatarUrl,
      bio: bio || null,
      status: 'pending',
    }

    const { data: insertedEntry, error: insertEntryError } = await supabaseAdmin
      .from('annuaire_entries')
      .insert(entryPayload)
      .select('*')
      .single()

    if (insertEntryError) {
      console.error('Insert annuaire entry error:', insertEntryError)
      return res.status(400).json({ error: "Impossible de créer l'entrée annuaire" })
    }

    const roleTableInfo = ANNULAIRE_ROLE_TABLES[normalizedRole]
    if (roleTableInfo?.table) {
      const roleInsertPayload = {
        annuaire_entry_id: insertedEntry.id,
        ...sanitizedMetadata,
      }

      const { error: roleInsertError } = await supabaseAdmin
        .from(roleTableInfo.table)
        .insert(roleInsertPayload)

      if (roleInsertError) {
        console.error('Insert annuaire role error:', roleInsertError)
        await supabaseAdmin.from('annuaire_entries').delete().eq('id', insertedEntry.id)
        return res.status(400).json({ error: "Impossible d'enregistrer les données spécifiques au rôle" })
      }
    }

    const { data: refreshedEntry, error: refreshedError } = await fetchAnnuaireEntryById(insertedEntry.id)
    if (refreshedError) {
      console.error('Refresh annuaire entry error:', refreshedError)
      return res.status(500).json({ error: 'Failed to retrieve created entry' })
    }

    const user = { avatar_url: avatarUrl }
    const responsePayload = buildAnnuaireResponse(refreshedEntry, user)
    
    // Ensure status is explicitly set to pending for new entries
    const finalResponse = {
      ...responsePayload,
      status: responsePayload.status || 'pending'
    }

    return res.status(201).json({ data: finalResponse, tempPassword })
  } catch (error) {
    console.error('Annuaire create error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.patch('/api/admin/annuaire/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const {
      name,
      email,
      phone,
      wilaya,
      commune,
      bio,
      avatar,
      status,
      roleSpecificData = {},
    } = req.body || {}

    const { data: existingEntry, error: fetchError } = await fetchAnnuaireEntryById(id)
    if (fetchError) {
      console.error('Fetch annuaire entry error:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch entry' })
    }

    if (!existingEntry) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    const updatedName = name !== undefined ? name : existingEntry.name
    const updatedEmail = email !== undefined ? email : existingEntry.email
    const updatedPhone = phone !== undefined ? phone : existingEntry.phone
    const updatedWilaya = wilaya !== undefined ? wilaya : existingEntry.wilaya
    const updatedCommune = commune !== undefined ? commune : existingEntry.commune
    const updatedBio = bio !== undefined ? bio : existingEntry.bio
    const updatedStatus = status !== undefined ? status : existingEntry.status

    const sanitizedMetadata = sanitizeRoleMetadata(existingEntry.annuaire_role, {
      ...existingEntry.metadata,
      ...roleSpecificData,
    })

    const missingRoleFields = validateRoleSpecificFields(existingEntry.annuaire_role, sanitizedMetadata)
    if (missingRoleFields.length) {
      return res.status(400).json({ error: `Champs requis manquants: ${missingRoleFields.join(', ')}` })
    }

    const ensureResult = await ensureUserForAnnuaire({
      annuaireRole: existingEntry.annuaire_role,
      name: updatedName,
      email: updatedEmail,
      phone: updatedPhone,
      wilaya: updatedWilaya,
      commune: updatedCommune,
      bio: updatedBio,
      avatar,
      metadata: sanitizedMetadata,
    })

    if (ensureResult.error) {
      console.error('Ensure annuaire user (update) error:', ensureResult.error)
      return res.status(400).json({ error: ensureResult.error.message || 'Failed to update associated user' })
    }

    const { avatarUrl } = ensureResult

    const updatePayload = {
      name: updatedName,
      email: updatedEmail,
      phone: updatedPhone || null,
      wilaya: updatedWilaya || null,
      commune: updatedCommune || null,
      bio: updatedBio || null,
      avatar_url: avatarUrl || existingEntry.avatar_url,
      status: updatedStatus,
    }

    const { data: updatedEntry, error: updateEntryError } = await supabaseAdmin
      .from('annuaire_entries')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (updateEntryError || !updatedEntry) {
      console.error('Update annuaire entry error:', updateEntryError)
      return res.status(400).json({ error: "Impossible de mettre à jour l'entrée annuaire" })
    }

    const roleTableInfo = ANNULAIRE_ROLE_TABLES[existingEntry.annuaire_role]
    if (roleTableInfo?.table) {
      const roleUpdatePayload = sanitizedMetadata

      // First try to update existing role-specific data
      const { data: existingRoleData, error: fetchRoleError } = await supabaseAdmin
        .from(roleTableInfo.table)
        .select('id')
        .eq('annuaire_entry_id', id)
        .maybeSingle()

      if (fetchRoleError) {
        console.error('Fetch role data error:', fetchRoleError)
      }

      if (existingRoleData) {
        // Update existing role-specific data
        const { error: roleUpdateError } = await supabaseAdmin
          .from(roleTableInfo.table)
          .update(roleUpdatePayload)
          .eq('annuaire_entry_id', id)

        if (roleUpdateError) {
          console.error('Update annuaire role error:', roleUpdateError)
          return res.status(400).json({ error: "Impossible de mettre à jour les données spécifiques au rôle" })
        }
      } else {
        // Insert new role-specific data if it doesn't exist
        const roleInsertPayload = {
          annuaire_entry_id: id,
          ...roleUpdatePayload,
        }

        const { error: roleInsertError } = await supabaseAdmin
          .from(roleTableInfo.table)
          .insert(roleInsertPayload)

        if (roleInsertError) {
          console.error('Insert annuaire role error:', roleInsertError)
          return res.status(400).json({ error: "Impossible de créer les données spécifiques au rôle" })
        }
      }
    }

    const { data: refreshedEntry, error: refreshedError } = await fetchAnnuaireEntryById(id)
    if (refreshedError) {
      console.error('Refresh updated annuaire entry error:', refreshedError)
      return res.status(500).json({ error: 'Failed to retrieve updated entry' })
    }

    const responsePayload = buildAnnuaireResponse(refreshedEntry, null)
    return res.status(200).json({ data: responsePayload })
  } catch (error) {
    console.error('Annuaire update error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.patch('/api/admin/annuaire/:id/status', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const { status } = req.body || {}

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' })
    }

    const { data: existingEntry, error: fetchError } = await fetchAnnuaireEntryById(id)
    if (fetchError) {
      console.error('Fetch annuaire entry error:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch entry' })
    }

    if (!existingEntry) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    const isActive = status === 'approved'
    const nowIso = new Date().toISOString()

    const [{ error: updateEntryError }, { error: userUpdateError }, profileResult] = await Promise.all([
      supabaseAdmin.from('annuaire_entries').update({ status, updated_at: nowIso }).eq('id', id),
      existingEntry.user_id
        ? supabaseAdmin
            .from('users')
            .update({ is_active: isActive, updated_at: nowIso })
            .eq('id', existingEntry.user_id)
        : Promise.resolve({ error: null }),
      (async () => {
        if (!existingEntry.user_id) {
          return { error: null }
        }

        const { data: profile, error: profileFetchError } = await supabaseAdmin
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', existingEntry.user_id)
          .maybeSingle()

        if (profileFetchError) {
          return { error: profileFetchError }
        }

        if (profile) {
          return await supabaseAdmin
            .from('user_profiles')
            .update({
              verification_status: status,
              verified_at: isActive ? nowIso : null,
              updated_at: nowIso,
            })
            .eq('user_id', existingEntry.user_id)
        }

        return await supabaseAdmin.from('user_profiles').insert({
          user_id: existingEntry.user_id,
          verification_status: status,
          verified_at: isActive ? nowIso : null,
          bio: existingEntry.bio || null,
          specialization: existingEntry.metadata?.specialization || null,
          license_number: existingEntry.metadata?.license_number || null,
          updated_at: nowIso,
        })
      })(),
    ])

    const profileError = profileResult?.error || null

    if (updateEntryError || userUpdateError || profileError) {
      console.error('Update annuaire status error:', updateEntryError || userUpdateError || profileError)
      return res.status(400).json({ error: "Impossible de mettre à jour le statut" })
    }

    const { data: refreshedEntry } = await fetchAnnuaireEntryById(id)
    const responsePayload = buildAnnuaireResponse(refreshedEntry, null)
    return res.status(200).json({ data: responsePayload })
  } catch (error) {
    console.error('Annuaire status update error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/admin/annuaire/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const { data: existingEntry, error: fetchError } = await fetchAnnuaireEntryById(id)
    if (fetchError) {
      console.error('Fetch annuaire entry error:', fetchError)
      return res.status(500).json({ error: 'Failed to fetch entry' })
    }

    if (!existingEntry) {
      return res.status(404).json({ error: 'Entry not found' })
    }

    const roleDeleteResult = await deleteRoleSpecificData(existingEntry.annuaire_role, id)
    if (roleDeleteResult.error) {
      console.error('Delete role-specific data error:', roleDeleteResult.error)
      return res.status(400).json({ error: "Impossible de supprimer les données spécifiques au rôle" })
    }

    const { error: deleteError } = await supabaseAdmin.from('annuaire_entries').delete().eq('id', id)

    if (deleteError) {
      console.error('Delete annuaire entry error:', deleteError)
      return res.status(400).json({ error: "Impossible de supprimer l'entrée" })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Annuaire delete error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

const parseNumeric = (value) => {
  if (value === undefined || value === null || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const parseJsonList = (value) => {
  if (value === undefined || value === null) return null
  if (Array.isArray(value)) return value

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch (_) {
      // Ignore JSON parse errors and fallback to line/CSV parsing
    }

    return trimmed
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }

  return null
}

const buildDoctorResponses = async (doctorRows) => {
  if (!doctorRows || doctorRows.length === 0) {
    return []
  }

  const userIds = Array.from(new Set(doctorRows.map((row) => row.user_id).filter(Boolean)))

  const [usersResult, profilesResult] = await Promise.all([
    userIds.length
      ? supabaseAdmin
          .from('users')
          .select('id,email,full_name,phone,wilaya,commune,avatar_url,is_active,created_at,updated_at')
          .in('id', userIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabaseAdmin
          .from('user_profiles')
          .select('user_id,bio,specialization,license_number,verification_status')
          .in('user_id', userIds)
      : Promise.resolve({ data: [] }),
  ])

  if (usersResult.error) {
    throw usersResult.error
  }
  if (profilesResult.error) {
    throw profilesResult.error
  }

  const userMap = new Map((usersResult.data || []).map((user) => [user.id, user]))
  const profileMap = new Map((profilesResult.data || []).map((profile) => [profile.user_id, profile]))

  return doctorRows.map((doctor) => mapDoctorResponse(doctor, userMap.get(doctor.user_id), profileMap.get(doctor.user_id)))
}

// Auth sign-in
app.post('/api/auth/sign-in', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    })

    const authData = await authResponse.json()

    if (!authResponse.ok || !authData.user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('id,email,full_name,role,is_active,avatar_url')
      .eq('id', authData.user.id)
      .single()

    if (!userProfile) {
      return res.status(401).json({ error: 'User profile not found' })
    }

    if (!userProfile.is_active) {
      return res.status(403).json({ error: 'User account is inactive' })
    }

    const role = (userProfile.role || '').toLowerCase()
    if (!ADMIN_ROLES.includes(role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const isProd = process.env.NODE_ENV === 'production'
    const cookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }
    res.cookie(SESSION_COOKIE_NAME, authData.access_token, cookieOpts)

    return res.status(200).json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        role: userProfile.role,
        avatar_url: userProfile.avatar_url,
      },
    })
  } catch (error) {
    console.error('Sign in error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/auth/sign-out', (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/', httpOnly: true, sameSite: 'lax' })
  return res.status(200).json({ success: true })
})

app.get('/api/auth/me', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return
  return res.status(200).json({
    id: adminUser.id,
    email: adminUser.email,
    full_name: adminUser.full_name,
    role: adminUser.role,
    phone: adminUser.phone,
    wilaya: adminUser.wilaya,
    commune: adminUser.commune,
  })
})

// Change password
app.post('/api/auth/change-password', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Les mots de passe sont requis' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' })
    }

    // Update password using Supabase admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return res.status(400).json({ message: 'Erreur lors du changement de mot de passe' })
    }

    return res.status(200).json({ success: true, message: 'Mot de passe changé avec succès' })
  } catch (error) {
    console.error('Change password error:', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
})

// Create user
app.post('/api/admin/users', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const {
      email,
      full_name,
      role = 'patient',
      phone,
      wilaya,
      commune,
      language = 'fr',
      avatar_url,
      avatar,
      is_active = true,
      password,
    } = req.body

    if (!email || !full_name || !wilaya || !commune) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const tempPassword = password || crypto.randomBytes(12).toString('base64url')

    const normalizedRole = String(role || 'patient')
    const normalizedLanguage = String(language || 'fr')
    const normalizedPhone = typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null
    let normalizedAvatar = typeof avatar_url === 'string' && avatar_url.trim() !== '' ? avatar_url : null
    const normalizedIsActive = is_active === true || is_active === 'true'

    const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (authError || !authResult?.user) {
      console.error('Create auth user error:', authError)
      return res.status(400).json({ error: authError?.message || 'Failed to create auth user' })
    }

    const userId = authResult.user.id

    const profilePayload = {
      id: userId,
      email,
      full_name,
      role: normalizedRole,
      phone: normalizedPhone,
      wilaya,
      commune,
      language: normalizedLanguage,
      avatar_url: normalizedAvatar,
      is_active: normalizedIsActive,
      email_verified: false,
    }

    const { data: insertedProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert(profilePayload)
      .select(
        'id,email,full_name,avatar_url,role,phone,wilaya,commune,language,is_active,email_verified,last_login_at,created_at,updated_at'
      )
      .single()

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.error('Insert user profile error:', profileError)
      return res.status(400).json({ error: 'Failed to save user profile' })
    }

    // Upload avatar after profile row exists
    if (avatar && avatar.data && avatar.name && avatar.type) {
      try {
        const base64 = typeof avatar.data === 'string' ? avatar.data.split(',').pop() : undefined
        if (!base64) {
          throw new Error('Invalid avatar payload')
        }

        const fileBuffer = Buffer.from(base64, 'base64')
        const extensionFromType = typeof avatar.type === 'string' ? avatar.type.split('/').pop() : undefined
        const extensionFromName = typeof avatar.name === 'string' ? avatar.name.split('.').pop() : undefined
        const fileExtension = (extensionFromType || extensionFromName || 'jpg').toLowerCase()
        const safeName = typeof avatar.name === 'string' ? avatar.name.replace(/[^a-zA-Z0-9-_.]/g, '-') : 'avatar'
        const storagePath = `${userId}/${Date.now()}-${safeName}.${fileExtension}`

        const { error: uploadError } = await supabaseAdmin.storage
          .from('avatars')
          .upload(storagePath, fileBuffer, {
            contentType: avatar.type || 'image/jpeg',
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: publicUrlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(storagePath)
        if (publicUrlData?.publicUrl) {
          normalizedAvatar = publicUrlData.publicUrl
          await supabaseAdmin
            .from('users')
            .update({ avatar_url: normalizedAvatar })
            .eq('id', userId)
        }
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError)
      }
    }

    return res.status(201).json({ data: insertedProfile, tempPassword })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Create user error:', error)
    return res.status(500).json({ error: message })
  }
})

app.get('/api/admin/doctors', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { search = '', status } = req.query

    const { data: doctorRows, error } = await supabaseAdmin
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch doctors error:', error)
      return res.status(500).json({ error: 'Failed to retrieve doctors' })
    }

    const doctors = await buildDoctorResponses(doctorRows || [])

    const normalizedSearch = typeof search === 'string' ? search.trim().toLowerCase() : ''
    const normalizedStatus = typeof status === 'string' ? status.trim().toLowerCase() : ''

    const filtered = doctors.filter((doctor) => {
      const matchesSearch = normalizedSearch
        ? [doctor.name, doctor.email, doctor.wilaya, doctor.commune, doctor.specialization]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch))
        : true

      const matchesStatus = normalizedStatus
        ? doctor.status?.toLowerCase() === normalizedStatus
        : true

      return matchesSearch && matchesStatus
    })

    return res.status(200).json({ data: filtered })
  } catch (error) {
    console.error('Doctors list error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/admin/doctors', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  const {
    name,
    email,
    phone,
    wilaya,
    commune,
    language = 'fr',
    bio,
    specialization,
    licenseNumber,
    hospitalAffiliation,
    consultationFee,
    yearsOfExperience,
    education,
    certifications,
    languagesSpoken,
    acceptsNewPatients = true,
    password,
    avatar,
  } = req.body || {}

  if (!name || !email || !wilaya || !commune || !specialization || !licenseNumber) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const trimmedLicense = String(licenseNumber).trim()

  const cleanupUser = async (userId) => {
    if (!userId) return
    try {
      await supabaseAdmin.from('doctors').delete().eq('user_id', userId)
      await supabaseAdmin.from('user_profiles').delete().eq('user_id', userId)
      await supabaseAdmin.from('users').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
    } catch (cleanupError) {
      console.error('Cleanup doctor user error:', cleanupError)
    }
  }

  try {
    const { data: existingDoctor, error: existingError } = await supabaseAdmin
      .from('doctors')
      .select('id')
      .eq('license_number', trimmedLicense)
      .maybeSingle()

    if (existingError) {
      console.error('Check license error:', existingError)
      return res.status(500).json({ error: 'Failed to verify license number' })
    }

    if (existingDoctor) {
      return res.status(409).json({ error: 'Cette licence médicale est déjà enregistrée' })
    }

    const tempPassword = password || crypto.randomBytes(12).toString('base64url')

    const authPayload = {
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name },
    }

    const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser(authPayload)

    if (authError || !authResult?.user) {
      console.error('Create doctor auth user error:', authError)
      return res.status(400).json({ error: authError?.message || 'Failed to create doctor user' })
    }

    const userId = authResult.user.id

    const normalizedPhone = typeof phone === 'string' && phone.trim() !== '' ? phone.trim() : null
    const normalizedLanguage = typeof language === 'string' && language.trim() !== '' ? language.trim() : 'fr'

    const profilePayload = {
      id: userId,
      email: email.trim(),
      full_name: name.trim(),
      role: 'doctor',
      phone: normalizedPhone,
      wilaya: wilaya.trim(),
      commune: commune.trim(),
      language: normalizedLanguage,
      avatar_url: null,
      is_active: false,
      email_verified: false,
    }

    const { error: userInsertError } = await supabaseAdmin.from('users').insert(profilePayload)

    if (userInsertError) {
      console.error('Insert doctor user profile error:', userInsertError)
      await cleanupUser(userId)
      return res.status(400).json({ error: 'Failed to save doctor user profile' })
    }

    const profileDetailsPayload = {
      user_id: userId,
      bio: bio ? String(bio) : null,
      specialization: specialization.trim(),
      license_number: trimmedLicense,
      verification_status: 'pending',
    }

    const { error: profileInsertError } = await supabaseAdmin
      .from('user_profiles')
      .upsert(profileDetailsPayload, { onConflict: 'user_id' })

    if (profileInsertError) {
      console.error('Insert doctor extended profile error:', profileInsertError)
      await cleanupUser(userId)
      return res.status(400).json({ error: 'Failed to save doctor profile details' })
    }

    const languagesArray = normalizeStringArray(languagesSpoken)
    const educationList = parseJsonList(education)
    const certificationsList = parseJsonList(certifications)

    const doctorPayload = {
      user_id: userId,
      specialization: specialization.trim(),
      license_number: trimmedLicense,
      hospital_affiliation: hospitalAffiliation ? String(hospitalAffiliation) : null,
      consultation_fee: parseNumeric(consultationFee),
      years_of_experience:
        yearsOfExperience === undefined || yearsOfExperience === null || yearsOfExperience === ''
          ? null
          : Number.parseInt(yearsOfExperience, 10) || null,
      education: educationList ? JSON.stringify(educationList) : null,
      certifications: certificationsList ? JSON.stringify(certificationsList) : null,
      languages_spoken: languagesArray,
      accepts_new_patients: acceptsNewPatients !== undefined ? Boolean(acceptsNewPatients) : true,
    }

    const { data: insertedDoctor, error: doctorInsertError } = await supabaseAdmin
      .from('doctors')
      .insert(doctorPayload)
      .select('*')
      .single()

    if (doctorInsertError || !insertedDoctor) {
      console.error('Insert doctor error:', doctorInsertError)
      await cleanupUser(userId)
      return res.status(400).json({ error: 'Failed to register doctor' })
    }

    let normalizedAvatar = null
    if (avatar && avatar.data && avatar.name) {
      try {
        const base64 = typeof avatar.data === 'string' ? avatar.data.split(',').pop() : undefined
        if (!base64) {
          throw new Error('Invalid avatar payload')
        }

        const fileBuffer = Buffer.from(base64, 'base64')
        const extensionFromType = typeof avatar.type === 'string' ? avatar.type.split('/').pop() : undefined
        const extensionFromName = typeof avatar.name === 'string' ? avatar.name.split('.').pop() : undefined
        const fileExtension = (extensionFromType || extensionFromName || 'jpg').toLowerCase()
        const sanitizedName = typeof avatar.name === 'string' ? avatar.name.replace(/[^a-zA-Z0-9-_.]/g, '-') : 'avatar'
        const hasExtension = sanitizedName.toLowerCase().endsWith(`.${fileExtension}`)
        const finalName = hasExtension ? sanitizedName : `${sanitizedName}.${fileExtension}`
        const storagePath = `${userId}/${Date.now()}-${finalName}`

        const { error: uploadError } = await supabaseAdmin.storage
          .from('avatars')
          .upload(storagePath, fileBuffer, {
            contentType: avatar.type || 'image/jpeg',
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: publicUrlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(storagePath)
        if (publicUrlData?.publicUrl) {
          normalizedAvatar = publicUrlData.publicUrl

          await supabaseAdmin
            .from('users')
            .update({ avatar_url: normalizedAvatar })
            .eq('id', userId)
        }
      } catch (uploadError) {
        console.error('Doctor avatar upload error:', uploadError)
      }
    }

    const doctorResponse = mapDoctorResponse(
      {
        ...insertedDoctor,
        education: educationList,
        certifications: certificationsList,
        languages_spoken: languagesArray,
      },
      {
        id: userId,
        email: email.trim(),
        full_name: name.trim(),
        phone: normalizedPhone,
        wilaya: wilaya.trim(),
        commune: commune.trim(),
        avatar_url: normalizedAvatar,
        is_active: false,
        created_at: insertedDoctor.created_at,
        updated_at: insertedDoctor.updated_at,
      },
      {
        user_id: userId,
        bio: bio ? String(bio) : null,
        specialization: specialization.trim(),
        license_number: trimmedLicense,
        verification_status: 'pending',
      }
    )

    return res.status(201).json({ data: doctorResponse, tempPassword })
  } catch (error) {
    console.error('Create doctor error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.patch('/api/admin/doctors/:id/status', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const { status } = req.body || {}

    if (!id || !status || !['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' })
    }

    const doctorFetchId = await supabaseAdmin
      .from('doctors')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (doctorFetchId.error) {
      console.error('Fetch doctor by id error:', doctorFetchId.error)
      return res.status(500).json({ error: 'Erreur lors de la récupération du médecin' })
    }

    let doctorRow = doctorFetchId.data

    if (!doctorRow) {
      const doctorFetchUser = await supabaseAdmin
        .from('doctors')
        .select('*')
        .eq('user_id', id)
        .maybeSingle()

      if (doctorFetchUser.error) {
        console.error('Fetch doctor by user error:', doctorFetchUser.error)
        return res.status(500).json({ error: 'Erreur lors de la récupération du médecin' })
      }

      doctorRow = doctorFetchUser.data
    }

    if (!doctorRow) {
      return res.status(404).json({ error: 'Médecin introuvable' })
    }

    const userId = doctorRow.user_id

    const isActive = status === 'approved'
    const nowIso = new Date().toISOString()

    const [{ data: existingProfile, error: profileFetchError }] = await Promise.all([
      supabaseAdmin
        .from('user_profiles')
        .select('id,user_id,verification_status')
        .eq('user_id', userId)
        .maybeSingle(),
    ])

    if (profileFetchError) {
      console.error('Fetch doctor profile error:', profileFetchError)
      return res.status(500).json({ error: 'Erreur lors de la récupération du profil médecin' })
    }

    const [{ error: profileMutationError }, { error: userUpdateError }, { error: doctorUpdateError }] = await Promise.all([
      existingProfile
        ? supabaseAdmin
            .from('user_profiles')
            .update({
              verification_status: status,
              verified_at: status === 'approved' ? nowIso : null,
              updated_at: nowIso,
            })
            .eq('user_id', userId)
        : supabaseAdmin
            .from('user_profiles')
            .insert({
              user_id: userId,
              verification_status: status,
              verified_at: status === 'approved' ? nowIso : null,
              bio: null,
              specialization: doctorRow.specialization || null,
              license_number: doctorRow.license_number || null,
              updated_at: nowIso,
            }),
      supabaseAdmin
        .from('users')
        .update({ is_active: isActive, updated_at: nowIso })
        .eq('id', userId),
      supabaseAdmin
        .from('doctors')
        .update({ updated_at: nowIso })
        .eq('id', id),
    ])

    if (profileMutationError || userUpdateError || doctorUpdateError) {
      console.error('Update doctor status error:', profileMutationError || userUpdateError || doctorUpdateError)
      return res.status(400).json({ error: 'Impossible de mettre à jour le statut' })
    }

    const [refreshedDoctorResult, usersResult, profilesResult] = await Promise.all([
      supabaseAdmin.from('doctors').select('*').eq('id', id).maybeSingle(),
      supabaseAdmin
        .from('users')
        .select('id,email,full_name,phone,wilaya,commune,avatar_url,is_active,created_at,updated_at')
        .eq('id', userId)
        .maybeSingle(),
      supabaseAdmin
        .from('user_profiles')
        .select('user_id,bio,specialization,license_number,verification_status')
        .eq('user_id', userId)
        .maybeSingle(),
    ])

    if (refreshedDoctorResult.error || usersResult.error || profilesResult.error || !refreshedDoctorResult.data) {
      console.error(
        'Fetch updated doctor relations error:',
        refreshedDoctorResult.error || usersResult.error || profilesResult.error
      )
      return res.status(500).json({ error: 'Erreur lors de la récupération du médecin' })
    }

    const doctorResponse = mapDoctorResponse(
      refreshedDoctorResult.data,
      usersResult.data || null,
      profilesResult.data || null
    )

    return res.status(200).json({ data: doctorResponse })
  } catch (error) {
    console.error('Doctor status update error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.patch('/api/admin/doctors/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Doctor ID is required' })
    }

    const {
      name,
      email,
      phone,
      wilaya,
      commune,
      language,
      bio,
      specialization,
      licenseNumber,
      hospitalAffiliation,
      consultationFee,
      yearsOfExperience,
      languagesSpoken,
      education,
      certifications,
      acceptsNewPatients,
      avatar,
    } = req.body || {}

    const doctorFetchId = await supabaseAdmin
      .from('doctors')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (doctorFetchId.error) {
      console.error('Fetch doctor by id error:', doctorFetchId.error)
      return res.status(500).json({ error: 'Erreur lors de la récupération du médecin' })
    }

    let doctorRow = doctorFetchId.data

    if (!doctorRow) {
      const doctorFetchUser = await supabaseAdmin
        .from('doctors')
        .select('*')
        .eq('user_id', id)
        .maybeSingle()

      if (doctorFetchUser.error) {
        console.error('Fetch doctor by user error:', doctorFetchUser.error)
        return res.status(500).json({ error: 'Erreur lors de la récupération du médecin' })
      }

      doctorRow = doctorFetchUser.data
    }

    if (!doctorRow) {
      return res.status(404).json({ error: 'Médecin introuvable' })
    }

    const doctorId = doctorRow.id
    const userId = doctorRow.user_id

    if (licenseNumber && licenseNumber !== doctorRow.license_number) {
      const { data: existingLicense, error: licenseError } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('license_number', licenseNumber)
        .neq('id', doctorId)
        .maybeSingle()

      if (licenseError) {
        console.error('License uniqueness check error:', licenseError)
        return res.status(500).json({ error: 'Erreur lors de la vérification du numéro de licence' })
      }

      if (existingLicense) {
        return res.status(409).json({ error: 'Ce numéro de licence est déjà utilisé par un autre médecin' })
      }
    }

    const nowIso = new Date().toISOString()

    const userUpdatePayload = {}
    if (typeof name === 'string' && name.trim() !== '') {
      userUpdatePayload.full_name = name.trim()
    }
    if (typeof email === 'string' && email.trim() !== '') {
      userUpdatePayload.email = email.trim()
    }
    if (typeof phone !== 'undefined') {
      if (phone === null) {
        userUpdatePayload.phone = null
      } else if (typeof phone === 'string') {
        const trimmedPhone = phone.trim()
        userUpdatePayload.phone = trimmedPhone.length > 0 ? trimmedPhone : null
      }
    }
    if (typeof wilaya === 'string' && wilaya.trim() !== '') {
      userUpdatePayload.wilaya = wilaya.trim()
    }
    if (typeof commune === 'string' && commune.trim() !== '') {
      userUpdatePayload.commune = commune.trim()
    }
    if (typeof language === 'string' && language.trim() !== '') {
      userUpdatePayload.language = language.trim()
    }
    if (Object.keys(userUpdatePayload).length > 0) {
      userUpdatePayload.updated_at = nowIso
      const { error: userUpdateError } = await supabaseAdmin.from('users').update(userUpdatePayload).eq('id', userId)
      if (userUpdateError) {
        console.error('Update doctor user error:', userUpdateError)
        return res.status(400).json({ error: 'Erreur lors de la mise à jour du profil utilisateur' })
      }
    }

    const profileUpdatePayload = {}
    if (typeof bio !== 'undefined') {
      profileUpdatePayload.bio = typeof bio === 'string' && bio.trim() !== '' ? bio.trim() : null
    }
    if (typeof specialization === 'string' && specialization.trim() !== '') {
      profileUpdatePayload.specialization = specialization.trim()
    }
    if (typeof licenseNumber === 'string' && licenseNumber.trim() !== '') {
      profileUpdatePayload.license_number = licenseNumber.trim()
    }
    if (Object.keys(profileUpdatePayload).length > 0) {
      profileUpdatePayload.user_id = userId
      profileUpdatePayload.updated_at = nowIso
      const { error: profileUpsertError } = await supabaseAdmin
        .from('user_profiles')
        .upsert(profileUpdatePayload, { onConflict: 'user_id' })

      if (profileUpsertError) {
        console.error('Update doctor profile error:', profileUpsertError)
        return res.status(400).json({ error: 'Erreur lors de la mise à jour du profil médecin' })
      }
    }

    const doctorUpdatePayload = {}
    if (typeof specialization === 'string' && specialization.trim() !== '') {
      doctorUpdatePayload.specialization = specialization.trim()
    }
    if (typeof licenseNumber === 'string' && licenseNumber.trim() !== '') {
      doctorUpdatePayload.license_number = licenseNumber.trim()
    }
    if (typeof hospitalAffiliation !== 'undefined') {
      doctorUpdatePayload.hospital_affiliation =
        typeof hospitalAffiliation === 'string' && hospitalAffiliation.trim() !== ''
          ? hospitalAffiliation.trim()
          : null
    }
    if (typeof consultationFee !== 'undefined') {
      const numericFee = consultationFee === null || consultationFee === '' ? null : Number(consultationFee)
      doctorUpdatePayload.consultation_fee = Number.isFinite(numericFee) ? numericFee : null
    }
    if (typeof yearsOfExperience !== 'undefined') {
      const numericYears = yearsOfExperience === null || yearsOfExperience === '' ? null : Number(yearsOfExperience)
      doctorUpdatePayload.years_of_experience = Number.isInteger(numericYears) ? numericYears : null
    }
    if (typeof languagesSpoken !== 'undefined') {
      if (Array.isArray(languagesSpoken)) {
        doctorUpdatePayload.languages_spoken = languagesSpoken
      } else if (typeof languagesSpoken === 'string') {
        doctorUpdatePayload.languages_spoken = languagesSpoken
          .split(/\r?\n|,/)
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      } else {
        doctorUpdatePayload.languages_spoken = null
      }
    }
    if (typeof education !== 'undefined') {
      let educationValue = education
      if (typeof education === 'string') {
        educationValue = education
          .split(/\r?\n|,/)
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      }
      doctorUpdatePayload.education = Array.isArray(educationValue) ? JSON.stringify(educationValue) : null
    }
    if (typeof certifications !== 'undefined') {
      let certificationsValue = certifications
      if (typeof certifications === 'string') {
        certificationsValue = certifications
          .split(/\r?\n|,/)
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
      }
      doctorUpdatePayload.certifications = Array.isArray(certificationsValue)
        ? JSON.stringify(certificationsValue)
        : null
    }
    if (typeof acceptsNewPatients !== 'undefined') {
      doctorUpdatePayload.accepts_new_patients = Boolean(acceptsNewPatients)
    }

    if (Object.keys(doctorUpdatePayload).length > 0) {
      doctorUpdatePayload.updated_at = nowIso
      const { error: doctorUpdateError } = await supabaseAdmin
        .from('doctors')
        .update(doctorUpdatePayload)
        .eq('id', doctorId)

      if (doctorUpdateError) {
        console.error('Update doctor record error:', doctorUpdateError)
        return res.status(400).json({ error: 'Erreur lors de la mise à jour des informations du médecin' })
      }
    }

    let avatarUrl
    if (avatar && avatar.data && avatar.name) {
      try {
        const base64 = typeof avatar.data === 'string' ? avatar.data.split(',').pop() : undefined
        if (!base64) {
          throw new Error('Invalid avatar payload')
        }

        const fileBuffer = Buffer.from(base64, 'base64')
        const extensionFromType = typeof avatar.type === 'string' ? avatar.type.split('/').pop() : undefined
        const extensionFromName = typeof avatar.name === 'string' ? avatar.name.split('.').pop() : undefined
        const fileExtension = (extensionFromType || extensionFromName || 'jpg').toLowerCase()
        const sanitizedName = typeof avatar.name === 'string' ? avatar.name.replace(/[^a-zA-Z0-9-_.]/g, '-') : 'avatar'
        const hasExtension = sanitizedName.toLowerCase().endsWith(`.${fileExtension}`)
        const finalName = hasExtension ? sanitizedName : `${sanitizedName}.${fileExtension}`
        const storagePath = `${userId}/${Date.now()}-${finalName}`

        const { error: uploadError } = await supabaseAdmin.storage
          .from('avatars')
          .upload(storagePath, fileBuffer, {
            contentType: avatar.type || 'image/jpeg',
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: publicUrlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(storagePath)
        if (publicUrlData?.publicUrl) {
          avatarUrl = publicUrlData.publicUrl
          const { error: avatarUpdateError } = await supabaseAdmin
            .from('users')
            .update({ avatar_url: avatarUrl, updated_at: nowIso })
            .eq('id', userId)

          if (avatarUpdateError) {
            console.error('Update doctor avatar url error:', avatarUpdateError)
          }
        }
      } catch (uploadError) {
        console.error('Doctor avatar update error:', uploadError)
      }
    }

    const [doctorResult, userResult, profileResult] = await Promise.all([
      supabaseAdmin
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .maybeSingle(),
      supabaseAdmin
        .from('users')
        .select('id,email,full_name,phone,wilaya,commune,avatar_url,is_active,created_at,updated_at')
        .eq('id', userId)
        .maybeSingle(),
      supabaseAdmin
        .from('user_profiles')
        .select('user_id,bio,specialization,license_number,verification_status')
        .eq('user_id', userId)
        .maybeSingle(),
    ])

    if (doctorResult.error || userResult.error || profileResult.error || !doctorResult.data) {
      console.error('Fetch updated doctor error:', doctorResult.error || userResult.error || profileResult.error)
      return res.status(500).json({ error: 'Erreur lors de la récupération du médecin mis à jour' })
    }

    const doctorResponse = mapDoctorResponse(
      doctorResult.data,
      userResult.data || null,
      profileResult.data || null
    )

    if (avatarUrl) {
      doctorResponse.avatarUrl = avatarUrl
    }

    return res.status(200).json({ data: doctorResponse })
  } catch (error) {
    console.error('Doctor update error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/admin/doctors/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Doctor ID is required' })
    }

    const doctorFetchId = await supabaseAdmin
      .from('doctors')
      .select('id,user_id')
      .eq('id', id)
      .maybeSingle()

    if (doctorFetchId.error) {
      console.error('Fetch doctor by id error:', doctorFetchId.error)
      return res.status(500).json({ error: 'Erreur lors de la récupération du médecin' })
    }

    let doctorRow = doctorFetchId.data

    if (!doctorRow) {
      const doctorFetchUser = await supabaseAdmin
        .from('doctors')
        .select('id,user_id')
        .eq('user_id', id)
        .maybeSingle()

      if (doctorFetchUser.error) {
        console.error('Fetch doctor by user error:', doctorFetchUser.error)
        return res.status(500).json({ error: 'Erreur lors de la récupération du médecin' })
      }

      doctorRow = doctorFetchUser.data
    }

    if (!doctorRow) {
      return res.status(404).json({ error: 'Médecin introuvable' })
    }

    const userId = doctorRow.user_id

    const { error: deleteDoctorError } = await supabaseAdmin
      .from('doctors')
      .delete()
      .eq('id', id)

    if (deleteDoctorError) {
      console.error('Delete doctor error:', deleteDoctorError)
      return res.status(400).json({ error: 'Impossible de supprimer ce médecin' })
    }

    const [{ error: deleteProfileError }, { error: deleteUserError }] = await Promise.all([
      supabaseAdmin.from('user_profiles').delete().eq('user_id', userId),
      supabaseAdmin.from('users').delete().eq('id', userId),
    ])

    if (deleteProfileError || deleteUserError) {
      console.error('Delete doctor dependencies error:', deleteProfileError || deleteUserError)
    }

    try {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    } catch (authDeleteError) {
      console.error('Delete doctor auth user error:', authDeleteError)
    }

    return res.status(200).json({ data: { id } })
  } catch (error) {
    console.error('Doctor delete error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Admin users list
app.get('/api/admin/users', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { page = '1', pageSize = '10', search = '', role = '', status = '' } = req.query

    console.log('Fetching users with params:', { page, pageSize, search, role, status })

    // Use Supabase client directly instead of REST API
    let query = supabaseAdmin
      .from('users')
      .select('id,email,full_name,avatar_url,role,phone,wilaya,commune,language,is_active,email_verified,last_login_at,created_at,updated_at')
      .order('created_at', { ascending: false })

    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = `%${search.trim()}%`
      query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
    }

    if (role && typeof role === 'string' && role.trim()) {
      const roles = role.split(',').map(r => r.trim()).filter(Boolean)
      if (roles.length > 0) {
        query = query.in('role', roles)
      }
    }

    if (status && typeof status === 'string' && status.trim()) {
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean)
      if (statuses.length > 0) {
        const isActiveValues = statuses.map(s => s === 'active' ? true : false)
        query = query.in('is_active', isActiveValues)
      }
    }

    const pageNum = Math.max(1, parseInt(page) || 1)
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize) || 10))
    const offset = (pageNum - 1) * pageSizeNum

    const { data, error, count } = await query.range(offset, offset + pageSizeNum - 1)

    if (error) {
      console.error('Supabase fetch failed:', error)
      return res.status(500).json({ error: 'Failed to fetch users from database', details: error.message })
    }

    console.log('Users fetched:', data?.length || 0, 'users, total count:', count)

    // Create clean response object
    const cleanUsers = (data || []).map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      phone: user.phone,
      wilaya: user.wilaya,
      commune: user.commune,
      language: user.language,
      is_active: user.is_active,
      email_verified: user.email_verified,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }))

    const responseBody = JSON.stringify({
      data: cleanUsers,
      total: count || 0,
      page: pageNum,
      pageSize: pageSizeNum,
    })
    console.log('Users response body length:', responseBody.length)
    console.log('Users response body preview:', responseBody.substring(0, 300))
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Length', responseBody.length)
    res.status(200).send(responseBody)
  } catch (error) {
    console.error('Admin users error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Update user
app.patch('/api/admin/users/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const {
      role,
      is_active,
      full_name,
      email,
      wilaya,
      commune,
      language,
      phone,
      avatar,
      avatar_url,
    } = req.body

    const updateData = {}

    const trimmedFullName = typeof full_name === 'string' ? full_name.trim() : undefined
    if (trimmedFullName) {
      updateData.full_name = trimmedFullName
    }

    const trimmedEmail = typeof email === 'string' ? email.trim() : undefined
    if (trimmedEmail) {
      updateData.email = trimmedEmail
    }

    const trimmedWilaya = typeof wilaya === 'string' ? wilaya.trim() : undefined
    if (trimmedWilaya) {
      updateData.wilaya = trimmedWilaya
    }

    const trimmedCommune = typeof commune === 'string' ? commune.trim() : undefined
    if (trimmedCommune) {
      updateData.commune = trimmedCommune
    }

    const normalizedLanguage = typeof language === 'string' ? language.trim() : undefined
    if (normalizedLanguage) {
      updateData.language = normalizedLanguage
    }

    if (phone !== undefined) {
      if (typeof phone === 'string') {
        const normalizedPhone = phone.trim()
        updateData.phone = normalizedPhone === '' ? null : normalizedPhone
      } else if (phone === null) {
        updateData.phone = null
      }
    }

    if (role !== undefined) {
      updateData.role = String(role)
    }

    if (is_active !== undefined) {
      if (typeof is_active === 'string') {
        updateData.is_active = is_active.toLowerCase() === 'true'
      } else {
        updateData.is_active = Boolean(is_active)
      }
    }

    if (avatar_url !== undefined) {
      if (avatar_url === null) {
        updateData.avatar_url = null
      } else if (typeof avatar_url === 'string' && avatar_url.trim() !== '') {
        updateData.avatar_url = avatar_url.trim()
      }
    }

    let uploadedAvatarUrl
    if (avatar && avatar.data && avatar.name && avatar.type) {
      try {
        const base64 = typeof avatar.data === 'string' ? avatar.data.split(',').pop() : undefined
        if (!base64) {
          throw new Error('Invalid avatar payload')
        }

        const fileBuffer = Buffer.from(base64, 'base64')
        const extensionFromType = typeof avatar.type === 'string' ? avatar.type.split('/').pop() : undefined
        const extensionFromName = typeof avatar.name === 'string' ? avatar.name.split('.').pop() : undefined
        const fileExtension = (extensionFromType || extensionFromName || 'jpg').toLowerCase()
        const sanitizedName = typeof avatar.name === 'string' ? avatar.name.replace(/[^a-zA-Z0-9-_.]/g, '-') : 'avatar'
        const hasExtension = sanitizedName.toLowerCase().endsWith(`.${fileExtension}`)
        const finalName = hasExtension ? sanitizedName : `${sanitizedName}.${fileExtension}`
        const storagePath = `${id}/${Date.now()}-${finalName}`

        const { error: uploadError } = await supabaseAdmin.storage
          .from('avatars')
          .upload(storagePath, fileBuffer, {
            contentType: avatar.type || 'image/jpeg',
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: publicUrlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(storagePath)
        if (publicUrlData?.publicUrl) {
          uploadedAvatarUrl = publicUrlData.publicUrl
          updateData.avatar_url = uploadedAvatarUrl
        }
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError)
      }
    }

    if (!Object.keys(updateData).length) {
      return res.status(400).json({ error: 'No updates provided' })
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select(
        'id,email,full_name,avatar_url,role,phone,wilaya,commune,language,is_active,email_verified,last_login_at,created_at,updated_at'
      )
      .single()

    if (updateError) {
      console.error('Update user profile error:', updateError)
      return res.status(400).json({ error: 'Failed to update user profile' })
    }

    // Sync annuaire entry status with user activation status
    if (is_active !== undefined) {
      const annuaireStatus = updateData.is_active ? 'approved' : 'pending'
      const { error: annuaireUpdateError } = await supabaseAdmin
        .from('annuaire_entries')
        .update({ status: annuaireStatus })
        .eq('user_id', id)
      
      if (annuaireUpdateError) {
        console.warn('Could not sync annuaire status:', annuaireUpdateError)
      }
    }

    const authUpdatePayload = {}
    if (trimmedEmail) {
      authUpdatePayload.email = trimmedEmail
    }
    if (trimmedFullName) {
      authUpdatePayload.user_metadata = { full_name: trimmedFullName }
    }

    if (Object.keys(authUpdatePayload).length) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(id, authUpdatePayload)
      } catch (authUpdateError) {
        console.error('Update auth user error:', authUpdateError)
      }
    }

    return res.status(200).json({ data: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const { error: profileError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (profileError) {
      console.error('Delete user profile error:', profileError)
      return res.status(400).json({ error: 'Failed to delete user profile' })
    }

    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (authDeleteError) {
      console.error('Delete auth user error:', authDeleteError)
    }

    return res.status(200).json({ data: { id } })
  } catch (error) {
    console.error('Delete user error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Wilayas and Communes data
const wilayasData = [
  {"id":"1","code":"1","name":"Adrar"},
  {"id":"2","code":"2","name":"Chlef"},
  {"id":"3","code":"3","name":"Laghouat"},
  {"id":"4","code":"4","name":"Oum El Bouaghi"},
  {"id":"5","code":"5","name":"Batna"},
  {"id":"6","code":"6","name":"Béjaïa"},
  {"id":"7","code":"7","name":"Biskra"},
  {"id":"8","code":"8","name":"Bechar"},
  {"id":"9","code":"9","name":"Blida"},
  {"id":"10","code":"10","name":"Bouira"},
  {"id":"11","code":"11","name":"Tamanrasset"},
  {"id":"12","code":"12","name":"Tbessa"},
  {"id":"13","code":"13","name":"Tlemcen"},
  {"id":"14","code":"14","name":"Tiaret"},
  {"id":"15","code":"15","name":"Tizi Ouzou"},
  {"id":"16","code":"16","name":"Alger"},
  {"id":"17","code":"17","name":"Djelfa"},
  {"id":"18","code":"18","name":"Jijel"},
  {"id":"19","code":"19","name":"Sétif"},
  {"id":"20","code":"20","name":"Saïda"},
  {"id":"21","code":"21","name":"Skikda"},
  {"id":"22","code":"22","name":"Sidi Bel Abbès"},
  {"id":"23","code":"23","name":"Annaba"},
  {"id":"24","code":"24","name":"Guelma"},
  {"id":"25","code":"25","name":"Constantine"},
  {"id":"26","code":"26","name":"Médéa"},
  {"id":"27","code":"27","name":"Mostaganem"},
  {"id":"28","code":"28","name":"M'Sila"},
  {"id":"29","code":"29","name":"Mascara"},
  {"id":"30","code":"30","name":"Ouargla"},
  {"id":"31","code":"31","name":"Oran"},
  {"id":"32","code":"32","name":"El Bayadh"},
  {"id":"33","code":"33","name":"Illizi"},
  {"id":"34","code":"34","name":"Bordj Bou Arreridj"},
  {"id":"35","code":"35","name":"Boumerdès"},
  {"id":"36","code":"36","name":"El Tarf"},
  {"id":"37","code":"37","name":"Tindouf"},
  {"id":"38","code":"38","name":"Tissemsilt"},
  {"id":"39","code":"39","name":"El Oued"},
  {"id":"40","code":"40","name":"Khenchela"},
  {"id":"41","code":"41","name":"Souk Ahras"},
  {"id":"42","code":"42","name":"Tipaza"},
  {"id":"43","code":"43","name":"Mila"},
  {"id":"44","code":"44","name":"Aïn Defla"},
  {"id":"45","code":"45","name":"Naâma"},
  {"id":"46","code":"46","name":"Aïn Témouchent"},
  {"id":"47","code":"47","name":"Ghardaïa"},
  {"id":"48","code":"48","name":"Relizane"},
  {"id":"49","code":"49","name":"El M'ghair"},
  {"id":"50","code":"50","name":"Bab El Oued"}
]

const communesData = {
  "16": [ // Alger
    {"id":"1","name":"Bab El Oued"},
    {"id":"2","name":"Sidi M'hamed"},
    {"id":"3","name":"Algiers Centre"},
    {"id":"4","name":"Casbah"},
    {"id":"5","name":"Belcourt"},
    {"id":"6","name":"Kouba"},
    {"id":"7","name":"Bouzareah"},
    {"id":"8","name":"Bir Mourad Raïs"},
    {"id":"9","name":"Hydra"},
    {"id":"10","name":"El Biar"},
    {"id":"11","name":"Birkhadem"},
    {"id":"12","name":"Ouled Fayet"},
    {"id":"13","name":"Dar El Beida"},
    {"id":"14","name":"Cheikh Bachir Ibrahimi"},
    {"id":"15","name":"Saoula"},
    {"id":"16","name":"Draria"},
    {"id":"17","name":"Baraki"},
    {"id":"18","name":"Bab Ezzouar"},
    {"id":"19","name":"Bachedjarah"},
    {"id":"20","name":"Sidi Moussa"},
    {"id":"21","name":"Oued Koriche"},
    {"id":"22","name":"Hammamet"},
    {"id":"23","name":"Rais Hamidou"},
    {"id":"24","name":"Mohammadia"},
    {"id":"25","name":"Bordj El Kiffan"},
    {"id":"26","name":"Bordj El Bahri"},
    {"id":"27","name":"Staouéli"},
    {"id":"28","name":"Zeralda"},
    {"id":"29","name":"Mahelma"}
  ]
}

// Get all wilayas
app.get('/api/wilayas', async (req, res) => {
  try {
    res.json(wilayasData)
  } catch (error) {
    console.error('Error fetching wilayas:', error)
    res.status(500).json({ error: 'Failed to fetch wilayas' })
  }
})

// Get communes by wilaya
app.get('/api/communes', async (req, res) => {
  try {
    const { wilaya_id } = req.query
    
    if (!wilaya_id) {
      return res.status(400).json({ error: 'wilaya_id is required' })
    }

    const communes = communesData[wilaya_id] || []
    res.json(communes)
  } catch (error) {
    console.error('Error fetching communes:', error)
    res.status(500).json({ error: 'Failed to fetch communes' })
  }
})

// =====================================================
// ABOUT PAGE MANAGEMENT ENDPOINTS
// =====================================================

// Get all about page sections
app.get('/api/admin/about/sections', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { data, error } = await supabaseAdmin
      .from('about_page')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Fetch about sections error:', error)
      return res.status(500).json({ error: 'Failed to fetch about sections' })
    }

    return res.json(data || [])
  } catch (error) {
    console.error('About sections error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Update a specific about page section
app.put('/api/admin/about/sections/:section', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  const { section } = req.params
  const { title_fr, title_ar, title_en, content_fr, content_ar, content_en, images, metadata } = req.body

  try {
    const updatePayload = {
      updated_by: adminUser.id,
      updated_at: new Date().toISOString()
    }

    if (title_fr !== undefined) updatePayload.title_fr = title_fr
    if (title_ar !== undefined) updatePayload.title_ar = title_ar
    if (title_en !== undefined) updatePayload.title_en = title_en
    if (content_fr !== undefined) updatePayload.content_fr = content_fr
    if (content_ar !== undefined) updatePayload.content_ar = content_ar
    if (content_en !== undefined) updatePayload.content_en = content_en
    if (images !== undefined) updatePayload.images = images
    if (metadata !== undefined) updatePayload.metadata = metadata

    const { data, error } = await supabaseAdmin
      .from('about_page')
      .upsert({ section, ...updatePayload }, { onConflict: 'section' })
      .select()
      .single()

    if (error) {
      console.error('Update about section error:', error)
      return res.status(500).json({ error: 'Failed to update section' })
    }

    return res.json(data)
  } catch (error) {
    console.error('About section update error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Get all team members
app.get('/api/admin/about/team', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Fetch team members error:', error)
      return res.status(500).json({ error: 'Failed to fetch team members' })
    }

    return res.json(data || [])
  } catch (error) {
    console.error('Team members error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Create a new team member
app.post('/api/admin/about/team', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  const { full_name, position_fr, position_ar, position_en, bio_fr, bio_ar, bio_en, email, linkedin_url, avatar_url, display_order } = req.body

  if (!full_name || !position_fr) {
    return res.status(400).json({ error: 'Full name and position (FR) are required' })
  }

  try {
    const insertPayload = {
      full_name,
      position_fr,
      position_ar: position_ar || null,
      position_en: position_en || null,
      bio_fr: bio_fr || null,
      bio_ar: bio_ar || null,
      bio_en: bio_en || null,
      email: email || null,
      linkedin_url: linkedin_url || null,
      avatar_url: avatar_url || null,
      display_order: display_order || 0,
      is_active: true
    }

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('Create team member error:', error)
      return res.status(500).json({ error: 'Failed to create team member' })
    }

    return res.status(201).json(data)
  } catch (error) {
    console.error('Team member creation error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Update an existing team member
app.put('/api/admin/about/team/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  const { id } = req.params
  const { full_name, position_fr, position_ar, position_en, bio_fr, bio_ar, bio_en, email, linkedin_url, avatar_url, display_order, is_active } = req.body

  try {
    const updatePayload = {
      updated_at: new Date().toISOString()
    }

    if (full_name !== undefined) updatePayload.full_name = full_name
    if (position_fr !== undefined) updatePayload.position_fr = position_fr
    if (position_ar !== undefined) updatePayload.position_ar = position_ar
    if (position_en !== undefined) updatePayload.position_en = position_en
    if (bio_fr !== undefined) updatePayload.bio_fr = bio_fr
    if (bio_ar !== undefined) updatePayload.bio_ar = bio_ar
    if (bio_en !== undefined) updatePayload.bio_en = bio_en
    if (email !== undefined) updatePayload.email = email
    if (linkedin_url !== undefined) updatePayload.linkedin_url = linkedin_url
    if (avatar_url !== undefined) updatePayload.avatar_url = avatar_url
    if (display_order !== undefined) updatePayload.display_order = display_order
    if (is_active !== undefined) updatePayload.is_active = is_active

    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update team member error:', error)
      return res.status(500).json({ error: 'Failed to update team member' })
    }

    if (!data) {
      return res.status(404).json({ error: 'Team member not found' })
    }

    return res.json(data)
  } catch (error) {
    console.error('Team member update error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Toggle team member active status
app.patch('/api/admin/about/team/:id/toggle', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  const { id } = req.params

  try {
    // First get the current status
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('team_members')
      .select('is_active')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      return res.status(404).json({ error: 'Team member not found' })
    }

    // Toggle the status
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({ is_active: !current.is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Toggle team member error:', error)
      return res.status(500).json({ error: 'Failed to toggle team member status' })
    }

    return res.json(data)
  } catch (error) {
    console.error('Team member toggle error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Delete a team member
app.delete('/api/admin/about/team/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  const { id } = req.params

  try {
    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete team member error:', error)
      return res.status(500).json({ error: 'Failed to delete team member' })
    }

    return res.json({ success: true, message: 'Team member deleted successfully' })
  } catch (error) {
    console.error('Team member deletion error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Get all contact information
app.get('/api/admin/about/contacts', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { data, error } = await supabaseAdmin
      .from('contact_info')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Fetch contact info error:', error)
      return res.status(500).json({ error: 'Failed to fetch contact information' })
    }

    return res.json(data || [])
  } catch (error) {
    console.error('Contact info error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Update all contact information
app.put('/api/admin/about/contacts', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  const { contacts } = req.body

  if (!Array.isArray(contacts)) {
    return res.status(400).json({ error: 'Contacts must be an array' })
  }

  try {
    // Delete existing contacts and insert new ones
    const { error: deleteError } = await supabaseAdmin
      .from('contact_info')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.error('Delete contacts error:', deleteError)
    }

    // Insert new contacts
    const insertData = contacts.map((contact, index) => ({
      type: contact.type || 'general',
      label_fr: contact.label_fr || contact.label || '',
      label_ar: contact.label_ar || null,
      label_en: contact.label_en || null,
      value: contact.value || '',
      icon: contact.icon || null,
      display_order: contact.display_order !== undefined ? contact.display_order : index,
      is_active: contact.is_active !== undefined ? contact.is_active : true
    }))

    if (insertData.length > 0) {
      const { data, error: insertError } = await supabaseAdmin
        .from('contact_info')
        .insert(insertData)
        .select()

      if (insertError) {
        console.error('Insert contacts error:', insertError)
        return res.status(500).json({ error: 'Failed to update contact information' })
      }

      return res.json(data)
    }

    return res.json([])
  } catch (error) {
    console.error('Contact info update error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// =====================================================
// PUBLIC ABOUT PAGE ENDPOINTS (for mobile app)
// =====================================================

// Public endpoint to get about page sections
app.get('/api/about/sections', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('about_page')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Fetch about sections error:', error)
      return res.status(500).json({ error: 'Failed to fetch about sections' })
    }

    return res.json(data || [])
  } catch (error) {
    console.error('About sections error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Public endpoint to get team members
app.get('/api/about/team', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Fetch team members error:', error)
      return res.status(500).json({ error: 'Failed to fetch team members' })
    }

    return res.json(data || [])
  } catch (error) {
    console.error('Team members error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Public endpoint to get contact information
app.get('/api/about/contacts', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_info')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Fetch contact info error:', error)
      return res.status(500).json({ error: 'Failed to fetch contact information' })
    }

    return res.json(data || [])
  } catch (error) {
    console.error('Contact info error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// =====================================================
// ACCOMMODATIONS MANAGEMENT ENDPOINTS (ADMIN)
// =====================================================

// Get accommodation statistics
app.get('/api/admin/accommodations/stats', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    console.log('[STATS] Fetching accommodations for stats...')
    const { data: accommodations, error } = await supabaseAdmin
      .from('accommodations')
      .select('capacity, available_beds, is_active')

    if (error) {
      console.error('Fetch accommodations stats error:', error)
      return res.status(500).json({ error: 'Failed to retrieve statistics', details: error.message })
    }

    console.log('[STATS] Found accommodations:', accommodations?.length || 0)
    if (accommodations && accommodations.length > 0) {
      console.log('[STATS] Sample:', JSON.stringify(accommodations[0]))
    }

    const stats = {
      total: accommodations?.length || 0,
      available: accommodations?.filter(a => a.is_active && a.available_beds > 0).length || 0,
      full: accommodations?.filter(a => a.is_active && a.available_beds === 0).length || 0,
      inactive: accommodations?.filter(a => !a.is_active).length || 0,
      total_capacity: accommodations?.reduce((sum, a) => sum + (a.capacity || 0), 0) || 0,
      total_available_beds: accommodations?.reduce((sum, a) => sum + (a.available_beds || 0), 0) || 0
    }

    console.log('[STATS] Calculated stats:', stats)
    return res.json(stats)
  } catch (error) {
    console.error('Accommodations stats error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Get all accommodations with filters
app.get('/api/admin/accommodations', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    console.log('[GET /api/admin/accommodations] Starting request')
    const { search = '', wilaya, disponibilite, is_active } = req.query

    let query = supabaseAdmin
      .from('accommodations')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by wilaya
    if (wilaya && typeof wilaya === 'string' && wilaya.trim()) {
      query = query.eq('wilaya', wilaya.trim())
    }

    // Filter by active status
    if (is_active !== undefined && is_active !== null && is_active !== '') {
      const isActiveValue = is_active === 'true' || is_active === true
      query = query.eq('is_active', isActiveValue)
    }

    const { data: accommodations, error } = await query

    if (error) {
      console.error('Fetch accommodations error:', error)
      return res.status(500).json({ error: 'Failed to fetch accommodations', details: error.message })
    }

    console.log('[GET /api/admin/accommodations] Fetched', accommodations?.length || 0, 'accommodations')
    if (accommodations && accommodations.length > 0) {
      console.log('[GET /api/admin/accommodations] First accommodation sample:', JSON.stringify(accommodations[0], null, 2))
    }

    let results = accommodations || []

    // Filter by search term (name, address, commune)
    if (search && typeof search === 'string' && search.trim()) {
      const normalizedSearch = search.trim().toLowerCase()
      results = results.filter((acc) => {
        return [acc.name, acc.address, acc.commune, acc.phone, acc.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch))
      })
    }

    // Filter by disponibilite
    if (disponibilite && typeof disponibilite === 'string') {
      if (disponibilite === 'available') {
        results = results.filter((acc) => acc.is_active && acc.available_beds > 0)
      } else if (disponibilite === 'full') {
        results = results.filter((acc) => acc.is_active && acc.available_beds === 0)
      }
    }

    // Add computed availability status and convert Decimal types to numbers
    const enrichedResults = results.map((acc) => ({
      ...acc,
      latitude: acc.latitude ? parseFloat(acc.latitude) : null,
      longitude: acc.longitude ? parseFloat(acc.longitude) : null,
      availability_status: !acc.is_active 
        ? 'inactive' 
        : acc.available_beds > 0 
          ? 'available' 
          : 'full'
    }))

    console.log('[GET /api/admin/accommodations] About to return', enrichedResults.length, 'results')
    try {
      const jsonStr = JSON.stringify(enrichedResults)
      console.log('[GET /api/admin/accommodations] JSON serialization successful')
      return res.json(enrichedResults)
    } catch (jsonErr) {
      console.error('[GET /api/admin/accommodations] JSON serialization error:', jsonErr)
      return res.status(500).json({ error: 'Failed to serialize response', details: jsonErr.message })
    }
  } catch (error) {
    console.error('Accommodations fetch error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Get single accommodation by ID
app.get('/api/admin/accommodations/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('accommodations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Accommodation not found' })
      }
      console.error('Fetch accommodation error:', error)
      return res.status(500).json({ error: 'Failed to fetch accommodation', details: error.message })
    }

    // Add computed availability status and convert Decimal types to numbers
    const enrichedData = {
      ...data,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      availability_status: !data.is_active 
        ? 'inactive' 
        : data.available_beds > 0 
          ? 'available' 
          : 'full'
    }

    return res.json(enrichedData)
  } catch (error) {
    console.error('Accommodation fetch error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Create new accommodation
app.post('/api/admin/accommodations', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const {
      name,
      description,
      address,
      wilaya,
      commune,
      phone,
      email,
      capacity,
      available_beds,
      amenities,
      rules,
      is_active,
      latitude,
      longitude
    } = req.body

    // Validation
    const errors = []
    if (!name || !name.trim()) errors.push('Le nom est requis')
    if (!wilaya || !wilaya.trim()) errors.push('La wilaya est requise')
    if (!commune || !commune.trim()) errors.push('La commune est requise')
    if (!address || !address.trim()) errors.push("L'adresse est requise")
    if (!phone || !phone.trim()) errors.push('Le téléphone est requis')
    if (capacity === undefined || capacity === null || capacity < 1) {
      errors.push('La capacité doit être au moins 1')
    }
    if (available_beds === undefined || available_beds === null || available_beds < 0) {
      errors.push('Les places disponibles doivent être >= 0')
    }
    if (capacity && available_beds > capacity) {
      errors.push('Les places disponibles ne peuvent pas dépasser la capacité totale')
    }

    // Email validation if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        errors.push('Format email invalide')
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    // Parse amenities and rules if they're strings
    const parsedAmenities = typeof amenities === 'string' 
      ? amenities.split('\n').map(a => a.trim()).filter(Boolean)
      : Array.isArray(amenities) ? amenities : null

    const parsedRules = typeof rules === 'string'
      ? rules.split('\n').map(r => r.trim()).filter(Boolean)
      : Array.isArray(rules) ? rules : null

    const insertData = {
      provider_id: adminUser.id,
      name: name.trim(),
      description: description?.trim() || null,
      address: address.trim(),
      wilaya: wilaya.trim(),
      commune: commune.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      capacity: parseInt(capacity),
      available_beds: parseInt(available_beds),
      amenities: parsedAmenities,
      rules: parsedRules,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null
    }

    const { data, error } = await supabaseAdmin
      .from('accommodations')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Create accommodation error:', error)
      return res.status(500).json({ error: 'Failed to create accommodation', details: error.message })
    }

    const enrichedData = {
      ...data,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    }

    return res.status(201).json(enrichedData)
  } catch (error) {
    console.error('Accommodation creation error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Update accommodation
app.put('/api/admin/accommodations/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const {
      name,
      description,
      address,
      wilaya,
      commune,
      phone,
      email,
      capacity,
      available_beds,
      amenities,
      rules,
      is_active,
      latitude,
      longitude
    } = req.body

    // Check if accommodation exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('accommodations')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Accommodation not found' })
    }

    // Validation
    const errors = []
    if (!name || !name.trim()) errors.push('Le nom est requis')
    if (!wilaya || !wilaya.trim()) errors.push('La wilaya est requise')
    if (!commune || !commune.trim()) errors.push('La commune est requise')
    if (!address || !address.trim()) errors.push("L'adresse est requise")
    if (!phone || !phone.trim()) errors.push('Le téléphone est requis')
    if (capacity === undefined || capacity === null || capacity < 1) {
      errors.push('La capacité doit être au moins 1')
    }
    if (available_beds === undefined || available_beds === null || available_beds < 0) {
      errors.push('Les places disponibles doivent être >= 0')
    }
    if (capacity && available_beds > capacity) {
      errors.push('Les places disponibles ne peuvent pas dépasser la capacité totale')
    }

    // Email validation if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        errors.push('Format email invalide')
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    // Parse amenities and rules if they're strings
    const parsedAmenities = typeof amenities === 'string' 
      ? amenities.split('\n').map(a => a.trim()).filter(Boolean)
      : Array.isArray(amenities) ? amenities : null

    const parsedRules = typeof rules === 'string'
      ? rules.split('\n').map(r => r.trim()).filter(Boolean)
      : Array.isArray(rules) ? rules : null

    const updateData = {
      name: name.trim(),
      description: description?.trim() || null,
      address: address.trim(),
      wilaya: wilaya.trim(),
      commune: commune.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      capacity: parseInt(capacity),
      available_beds: parseInt(available_beds),
      amenities: parsedAmenities,
      rules: parsedRules,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('accommodations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update accommodation error:', error)
      return res.status(500).json({ error: 'Failed to update accommodation', details: error.message })
    }

    const enrichedData = {
      ...data,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
    }

    return res.json(enrichedData)
  } catch (error) {
    console.error('Accommodation update error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Delete accommodation
app.delete('/api/admin/accommodations/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('accommodations')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Accommodation not found' })
      }
      console.error('Delete accommodation error:', error)
      return res.status(500).json({ error: 'Failed to delete accommodation', details: error.message })
    }

    return res.json({ message: 'Accommodation deleted successfully', data })
  } catch (error) {
    console.error('Accommodation deletion error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// =====================================================
// COMMENT MODERATION ENDPOINTS
// =====================================================

// Get all comments with filters and enriched data
app.get('/api/admin/comments', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const {
      search = '',
      status,
      article_type,
      min_reports,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query

    console.log('Fetching comments with params:', { search, status, article_type, min_reports, date_from, date_to })

    // Build the base query
    let query = supabaseAdmin
      .from('comments')
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          email,
          role,
          avatar_url
        ),
        community_post:post_id (
          id,
          title,
          cancer_type,
          status
        ),
        moderated_by_user:moderated_by (
          id,
          full_name
        )
      `)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('moderation_status', status)
    }

    if (date_from) {
      query = query.gte('created_at', date_from)
    }

    if (date_to) {
      query = query.lte('created_at', date_to)
    }

    // Apply sorting
    const sortField = sort_by === 'created_at' ? 'created_at' : 'created_at'
    const ascending = sort_order === 'asc'
    query = query.order(sortField, { ascending })

    const { data: commentsData, error: commentsError } = await query

    if (commentsError) {
      console.error('Fetch comments error:', commentsError)
      return res.status(500).json({ error: 'Failed to retrieve comments', details: commentsError.message })
    }

    console.log('Comments fetched:', commentsData?.length || 0)

    // Get report counts for each comment
    const commentIds = (commentsData || []).map(c => c.id)
    let reportsMap = new Map()

    if (commentIds.length > 0) {
      const { data: reportsData, error: reportsError } = await supabaseAdmin
        .from('comment_reports')
        .select('comment_id, id, reason, description, reporter_id, created_at')
        .in('comment_id', commentIds)

      if (!reportsError && reportsData) {
        reportsData.forEach(report => {
          if (!reportsMap.has(report.comment_id)) {
            reportsMap.set(report.comment_id, [])
          }
          reportsMap.get(report.comment_id).push(report)
        })
      }
    }

    // Enrich comments with report counts
    let enrichedComments = (commentsData || []).map(comment => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.user?.id || null,
        name: comment.user?.full_name || 'Unknown',
        email: comment.user?.email || null,
        role: comment.user?.role || 'patient',
        avatar_url: comment.user?.avatar_url || null
      },
      post: {
        id: comment.community_post?.id || null,
        title: comment.community_post?.title || 'Unknown Post',
        cancer_type: comment.community_post?.cancer_type || null,
        status: comment.community_post?.status || null
      },
      status: comment.moderation_status || 'pending',
      reports_count: reportsMap.get(comment.id)?.length || 0,
      reports: reportsMap.get(comment.id) || [],
      moderated_by: comment.moderated_by_user?.full_name || null,
      moderated_at: comment.moderated_at || null,
      moderation_reason: comment.moderation_reason || null,
      is_anonymous: comment.is_anonymous || false,
      likes_count: comment.likes_count || 0,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    }))

    // Apply client-side filters
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase()
      enrichedComments = enrichedComments.filter(comment =>
        comment.content.toLowerCase().includes(searchLower) ||
        comment.author.name.toLowerCase().includes(searchLower) ||
        comment.post.title.toLowerCase().includes(searchLower)
      )
    }

    if (article_type && article_type !== 'all') {
      enrichedComments = enrichedComments.filter(comment =>
        comment.post.cancer_type === article_type
      )
    }

    if (min_reports) {
      const minReportsNum = parseInt(min_reports)
      if (!isNaN(minReportsNum)) {
        enrichedComments = enrichedComments.filter(comment =>
          comment.reports_count >= minReportsNum
        )
      }
    }

    console.log('Returning enriched comments:', enrichedComments.length)
    return res.json(enrichedComments)
  } catch (error) {
    console.error('Comments list error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Get comment statistics
app.get('/api/admin/comments/stats', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select('moderation_status')

    if (error) {
      console.error('Fetch comments stats error:', error)
      return res.status(500).json({ error: 'Failed to retrieve statistics', details: error.message })
    }

    // Get report counts
    const { data: reports, error: reportsError } = await supabaseAdmin
      .from('comment_reports')
      .select('comment_id')

    const reportedCommentIds = new Set((reports || []).map(r => r.comment_id))

    const stats = {
      total: comments?.length || 0,
      approved: comments?.filter(c => c.moderation_status === 'approved').length || 0,
      pending: comments?.filter(c => c.moderation_status === 'pending').length || 0,
      reported: reportedCommentIds.size || 0,
      rejected: comments?.filter(c => c.moderation_status === 'rejected').length || 0,
      flagged: comments?.filter(c => c.moderation_status === 'flagged').length || 0
    }

    return res.json(stats)
  } catch (error) {
    console.error('Comments stats error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Update comment status
app.put('/api/admin/comments/:id/status', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const { status, reason } = req.body

    if (!status || !['approved', 'rejected', 'flagged', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: approved, rejected, flagged, or pending' })
    }

    // Check if comment exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Update the comment
    const updateData = {
      moderation_status: status,
      moderated_by: adminUser.id,
      moderated_at: new Date().toISOString(),
      moderation_reason: reason || null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update comment status error:', error)
      return res.status(500).json({ error: 'Failed to update comment status', details: error.message })
    }

    return res.json({ message: 'Comment status updated successfully', data })
  } catch (error) {
    console.error('Comment status update error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Delete comment
app.delete('/api/admin/comments/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const { hard_delete } = req.query

    if (hard_delete === 'true') {
      // Hard delete
      const { data, error } = await supabaseAdmin
        .from('comments')
        .delete()
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Comment not found' })
        }
        console.error('Delete comment error:', error)
        return res.status(500).json({ error: 'Failed to delete comment', details: error.message })
      }

      return res.json({ message: 'Comment deleted successfully', data })
    } else {
      // Soft delete (set status to rejected)
      const updateData = {
        moderation_status: 'rejected',
        moderated_by: adminUser.id,
        moderated_at: new Date().toISOString(),
        moderation_reason: 'Deleted by admin',
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabaseAdmin
        .from('comments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Comment not found' })
        }
        console.error('Soft delete comment error:', error)
        return res.status(500).json({ error: 'Failed to delete comment', details: error.message })
      }

      return res.json({ message: 'Comment deleted successfully', data })
    }
  } catch (error) {
    console.error('Comment deletion error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Bulk action on comments
app.post('/api/admin/comments/bulk-action', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { commentIds, action, reason } = req.body

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({ error: 'commentIds must be a non-empty array' })
    }

    if (!action || !['approve', 'reject', 'delete', 'flag'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be: approve, reject, delete, or flag' })
    }

    let updateData = {
      moderated_by: adminUser.id,
      moderated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (action === 'approve') {
      updateData.moderation_status = 'approved'
      updateData.moderation_reason = reason || 'Bulk approved'
    } else if (action === 'reject' || action === 'delete') {
      updateData.moderation_status = 'rejected'
      updateData.moderation_reason = reason || 'Bulk rejected'
    } else if (action === 'flag') {
      updateData.moderation_status = 'flagged'
      updateData.moderation_reason = reason || 'Bulk flagged'
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .update(updateData)
      .in('id', commentIds)
      .select()

    if (error) {
      console.error('Bulk action error:', error)
      return res.status(500).json({ error: 'Failed to perform bulk action', details: error.message })
    }

    return res.json({ message: `Bulk ${action} completed successfully`, updated: data?.length || 0 })
  } catch (error) {
    console.error('Bulk action error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// =====================================================
// ADVERTISING MANAGEMENT ENDPOINTS (ADMIN)
// =====================================================

// Get advertisement statistics
app.get('/api/admin/advertisements/stats', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { data: ads, error } = await supabaseAdmin
      .from('advertisement_requests')
      .select('status, end_date')

    if (error) {
      console.error('Fetch advertisements stats error:', error)
      return res.status(500).json({ error: 'Failed to retrieve statistics', details: error.message })
    }

    const now = new Date()
    const stats = {
      total: ads?.length || 0,
      pending: ads?.filter(a => a.status === 'pending').length || 0,
      approved: ads?.filter(a => a.status === 'approved' && (!a.end_date || new Date(a.end_date) >= now)).length || 0,
      rejected: ads?.filter(a => a.status === 'rejected').length || 0,
      expired: ads?.filter(a => a.status === 'expired' || (a.status === 'approved' && a.end_date && new Date(a.end_date) < now)).length || 0
    }

    return res.json(stats)
  } catch (error) {
    console.error('Advertisements stats error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Get all advertisement requests with filters
app.get('/api/admin/advertisements', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { search = '', status, ad_type, date_from, date_to } = req.query

    let query = supabaseAdmin
      .from('advertisement_requests')
      .select(`
        *,
        reviewer:reviewed_by (
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      if (status === 'active') {
        // Active means approved and not expired
        query = query.eq('status', 'approved')
      } else {
        query = query.eq('status', status)
      }
    }

    if (ad_type && ad_type !== 'all') {
      query = query.eq('ad_type', ad_type)
    }

    if (date_from) {
      query = query.gte('created_at', date_from)
    }

    if (date_to) {
      query = query.lte('created_at', date_to)
    }

    const { data: adsData, error: adsError } = await query

    if (adsError) {
      console.error('Fetch advertisements error:', adsError)
      return res.status(500).json({ error: 'Failed to retrieve advertisements', details: adsError.message })
    }

    // Enrich with computed status
    const now = new Date()
    let enrichedAds = (adsData || []).map(ad => ({
      ...ad,
      computed_status: ad.status === 'approved' && ad.end_date && new Date(ad.end_date) < now ? 'expired' : ad.status,
      is_active: ad.status === 'approved' && (!ad.end_date || new Date(ad.end_date) >= now)
    }))

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase()
      enrichedAds = enrichedAds.filter(ad =>
        ad.company_name.toLowerCase().includes(searchLower) ||
        ad.contact_name.toLowerCase().includes(searchLower) ||
        ad.contact_email.toLowerCase().includes(searchLower)
      )
    }

    return res.json(enrichedAds)
  } catch (error) {
    console.error('Advertisements list error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Approve advertisement request
app.put('/api/admin/advertisements/:id/approve', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    // Get the advertisement to calculate end date
    const { data: ad, error: fetchError } = await supabaseAdmin
      .from('advertisement_requests')
      .select('duration_days')
      .eq('id', id)
      .single()

    if (fetchError || !ad) {
      return res.status(404).json({ error: 'Advertisement not found' })
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + ad.duration_days)

    const updateData = {
      status: 'approved',
      reviewed_by: adminUser.id,
      reviewed_at: new Date().toISOString(),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('advertisement_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Approve advertisement error:', error)
      return res.status(500).json({ error: 'Failed to approve advertisement', details: error.message })
    }

    return res.json({ message: 'Advertisement approved successfully', data })
  } catch (error) {
    console.error('Advertisement approval error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Reject advertisement request
app.put('/api/admin/advertisements/:id/reject', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' })
    }

    const updateData = {
      status: 'rejected',
      reviewed_by: adminUser.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('advertisement_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Advertisement not found' })
      }
      console.error('Reject advertisement error:', error)
      return res.status(500).json({ error: 'Failed to reject advertisement', details: error.message })
    }

    return res.json({ message: 'Advertisement rejected successfully', data })
  } catch (error) {
    console.error('Advertisement rejection error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Mark advertisement as expired
app.put('/api/admin/advertisements/:id/expire', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const updateData = {
      status: 'expired',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('advertisement_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Advertisement not found' })
      }
      console.error('Expire advertisement error:', error)
      return res.status(500).json({ error: 'Failed to expire advertisement', details: error.message })
    }

    return res.json({ message: 'Advertisement marked as expired', data })
  } catch (error) {
    console.error('Advertisement expiration error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// =====================================================
// I3LAM ARTICLES ENDPOINTS
// =====================================================

// Get all articles (admin)
app.get('/api/admin/i3lam/articles', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { search = '', status, category, author_id, date_from, date_to, sort_by = 'created_at', sort_order = 'desc' } = req.query

    let query = supabaseAdmin
      .from('articles')
      .select(`
        *,
        author:users!author_id(id, full_name, email, avatar_url),
        category:article_categories!category_id(id, name_fr, name_ar, slug, color)
      `)
      .order(sort_by, { ascending: sort_order === 'asc' })

    if (status && status !== 'all') {
      query = query.eq('article_status', status)
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    if (author_id) {
      query = query.eq('author_id', author_id)
    }

    if (date_from) {
      query = query.gte('created_at', date_from)
    }

    if (date_to) {
      query = query.lte('created_at', date_to)
    }

    const { data, error } = await query

    if (error) {
      console.error('Fetch articles error:', error)
      return res.status(500).json({ error: 'Failed to fetch articles', details: error.message })
    }

    let articles = data || []

    if (search && search.trim()) {
      const normalizedSearch = search.trim().toLowerCase()
      articles = articles.filter((article) =>
        [article.title, article.excerpt, article.author?.full_name, article.category?.name_fr]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      )
    }

    return res.json({ data: articles })
  } catch (error) {
    console.error('Articles list error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Get single article
app.get('/api/admin/i3lam/articles/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('articles')
      .select(`
        *,
        author:users!author_id(id, full_name, email, avatar_url),
        category:article_categories!category_id(id, name_fr, name_ar, slug, color)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Article not found' })
      }
      console.error('Fetch article error:', error)
      return res.status(500).json({ error: 'Failed to fetch article', details: error.message })
    }

    return res.json({ data })
  } catch (error) {
    console.error('Article fetch error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Create article
app.post('/api/admin/i3lam/articles', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const {
      title,
      slug,
      content,
      excerpt,
      featured_image,
      thumbnail,
      category_id,
      tags,
      meta_title,
      meta_description,
      seo_slug,
      article_status = 'brouillon',
      scheduled_at,
      is_featured = false
    } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' })
    }

    const articleData = {
      author_id: adminUser.id,
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content,
      excerpt,
      featured_image,
      thumbnail,
      category_id,
      tags,
      meta_title,
      meta_description,
      seo_slug: seo_slug || slug,
      article_status,
      scheduled_at,
      is_featured,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (article_status === 'publie') {
      articleData.published_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert(articleData)
      .select(`
        *,
        author:users!author_id(id, full_name, email),
        category:article_categories!category_id(id, name_fr, slug)
      `)
      .single()

    if (error) {
      console.error('Create article error:', error)
      return res.status(500).json({ error: 'Failed to create article', details: error.message })
    }

    return res.json({ message: 'Article created successfully', data })
  } catch (error) {
    console.error('Article creation error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Update article
app.put('/api/admin/i3lam/articles/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    }

    // If publishing, set published_at
    if (updateData.article_status === 'publie' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:users!author_id(id, full_name, email),
        category:article_categories!category_id(id, name_fr, slug)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Article not found' })
      }
      console.error('Update article error:', error)
      return res.status(500).json({ error: 'Failed to update article', details: error.message })
    }

    return res.json({ message: 'Article updated successfully', data })
  } catch (error) {
    console.error('Article update error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Delete article
app.delete('/api/admin/i3lam/articles/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Article not found' })
      }
      console.error('Delete article error:', error)
      return res.status(500).json({ error: 'Failed to delete article', details: error.message })
    }

    return res.json({ message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Article deletion error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Bulk actions
app.post('/api/admin/i3lam/articles/bulk', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { action, article_ids } = req.body

    if (!action || !article_ids || !Array.isArray(article_ids) || article_ids.length === 0) {
      return res.status(400).json({ error: 'Action and article IDs are required' })
    }

    let updateData = { updated_at: new Date().toISOString() }

    switch (action) {
      case 'publish':
        updateData.article_status = 'publie'
        updateData.published_at = new Date().toISOString()
        break
      case 'archive':
        updateData.article_status = 'archive'
        break
      case 'delete':
        const { error: deleteError } = await supabaseAdmin
          .from('articles')
          .delete()
          .in('id', article_ids)

        if (deleteError) {
          console.error('Bulk delete error:', deleteError)
          return res.status(500).json({ error: 'Failed to delete articles', details: deleteError.message })
        }

        return res.json({ message: `${article_ids.length} articles deleted successfully` })
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update(updateData)
      .in('id', article_ids)
      .select()

    if (error) {
      console.error('Bulk update error:', error)
      return res.status(500).json({ error: 'Failed to update articles', details: error.message })
    }

    return res.json({ message: `${article_ids.length} articles ${action}ed successfully`, data })
  } catch (error) {
    console.error('Bulk action error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Toggle featured status
app.put('/api/admin/i3lam/articles/:id/featured', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const { is_featured } = req.body

    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({
        is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Article not found' })
      }
      console.error('Toggle featured error:', error)
      return res.status(500).json({ error: 'Failed to toggle featured status', details: error.message })
    }

    return res.json({ message: 'Featured status updated', data })
  } catch (error) {
    console.error('Featured toggle error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Get statistics
app.get('/api/admin/i3lam/stats', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('article_status, views_count')

    if (error) {
      console.error('Fetch stats error:', error)
      return res.status(500).json({ error: 'Failed to fetch statistics', details: error.message })
    }

    const stats = {
      total: data.length,
      brouillon: data.filter(a => a.article_status === 'brouillon').length,
      en_revision: data.filter(a => a.article_status === 'en_revision').length,
      planifie: data.filter(a => a.article_status === 'planifie').length,
      publie: data.filter(a => a.article_status === 'publie').length,
      archive: data.filter(a => a.article_status === 'archive').length,
      total_views: data.reduce((sum, a) => sum + (a.views_count || 0), 0)
    }

    return res.json({ data: stats })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Get categories
app.get('/api/admin/i3lam/categories', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { data, error } = await supabaseAdmin
      .from('article_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      console.error('Fetch categories error:', error)
      return res.status(500).json({ error: 'Failed to fetch categories', details: error.message })
    }

    return res.json({ data: data || [] })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// =====================================================
// KHIBRATI PUBLICATIONS ENDPOINTS
// =====================================================

// Get all publications (admin)
app.get('/api/admin/khibrati/publications', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { search = '', status, specialty, doctor_id } = req.query

    let query = supabaseAdmin
      .from('khibrati_publications')
      .select(`
        *,
        author:users!author_id(id, full_name, email, avatar_url, phone),
        specialty:specialties!specialty_id(id, name_fr, name_ar, slug),
        moderator:users!moderated_by(id, full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (specialty) {
      query = query.eq('specialty_id', specialty)
    }

    if (doctor_id) {
      query = query.eq('author_id', doctor_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Fetch publications error:', error)
      return res.status(500).json({ error: 'Failed to fetch publications', details: error.message })
    }

    let publications = data || []

    if (search && search.trim()) {
      const normalizedSearch = search.trim().toLowerCase()
      publications = publications.filter((pub) =>
        [pub.title, pub.author?.full_name, pub.specialty?.name_fr]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      )
    }

    return res.json({ data: publications })
  } catch (error) {
    console.error('Publications list error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Get single publication
app.get('/api/admin/khibrati/publications/:id', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('khibrati_publications')
      .select(`
        *,
        author:users!author_id(id, full_name, email, avatar_url, phone, wilaya, commune),
        specialty:specialties!specialty_id(id, name_fr, name_ar, slug),
        moderator:users!moderated_by(id, full_name, email),
        history:khibrati_publication_history(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Publication not found' })
      }
      console.error('Fetch publication error:', error)
      return res.status(500).json({ error: 'Failed to fetch publication', details: error.message })
    }

    return res.json({ data })
  } catch (error) {
    console.error('Publication fetch error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Approve publication
app.put('/api/admin/khibrati/publications/:id/approve', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const updateData = {
      status: 'approuvee',
      moderated_by: adminUser.id,
      moderated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      rejection_reason: null,
      modification_notes: null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('khibrati_publications')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:users!author_id(id, full_name, email),
        specialty:specialties!specialty_id(id, name_fr, name_ar)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Publication not found' })
      }
      console.error('Approve publication error:', error)
      return res.status(500).json({ error: 'Failed to approve publication', details: error.message })
    }

    return res.json({ message: 'Publication approved successfully', data })
  } catch (error) {
    console.error('Publication approval error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Reject publication
app.put('/api/admin/khibrati/publications/:id/reject', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' })
    }

    const updateData = {
      status: 'rejetee',
      moderated_by: adminUser.id,
      moderated_at: new Date().toISOString(),
      rejection_reason: reason,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('khibrati_publications')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:users!author_id(id, full_name, email),
        specialty:specialties!specialty_id(id, name_fr, name_ar)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Publication not found' })
      }
      console.error('Reject publication error:', error)
      return res.status(500).json({ error: 'Failed to reject publication', details: error.message })
    }

    return res.json({ message: 'Publication rejected successfully', data })
  } catch (error) {
    console.error('Publication rejection error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Request modifications
app.put('/api/admin/khibrati/publications/:id/request-modifications', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const { notes } = req.body

    if (!notes || !notes.trim()) {
      return res.status(400).json({ error: 'Modification notes are required' })
    }

    const updateData = {
      status: 'modifications_demandees',
      moderated_by: adminUser.id,
      moderated_at: new Date().toISOString(),
      modification_notes: notes,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('khibrati_publications')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:users!author_id(id, full_name, email),
        specialty:specialties!specialty_id(id, name_fr, name_ar)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Publication not found' })
      }
      console.error('Request modifications error:', error)
      return res.status(500).json({ error: 'Failed to request modifications', details: error.message })
    }

    return res.json({ message: 'Modification request sent successfully', data })
  } catch (error) {
    console.error('Modification request error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Update publication status
app.put('/api/admin/khibrati/publications/:id/status', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['en_attente', 'en_revision', 'modifications_demandees', 'approuvee', 'rejetee', 'archivee']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const updateData = {
      status,
      moderated_by: adminUser.id,
      moderated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (status === 'approuvee' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('khibrati_publications')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:users!author_id(id, full_name, email),
        specialty:specialties!specialty_id(id, name_fr, name_ar)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Publication not found' })
      }
      console.error('Update status error:', error)
      return res.status(500).json({ error: 'Failed to update status', details: error.message })
    }

    return res.json({ message: 'Status updated successfully', data })
  } catch (error) {
    console.error('Status update error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Archive publication
app.put('/api/admin/khibrati/publications/:id/archive', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { id } = req.params

    const updateData = {
      status: 'archivee',
      moderated_by: adminUser.id,
      moderated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('khibrati_publications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Publication not found' })
      }
      console.error('Archive publication error:', error)
      return res.status(500).json({ error: 'Failed to archive publication', details: error.message })
    }

    return res.json({ message: 'Publication archived successfully', data })
  } catch (error) {
    console.error('Publication archival error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Get publication statistics
app.get('/api/admin/khibrati/stats', async (req, res) => {
  const adminUser = await requireAdminAuth(req, res)
  if (!adminUser) return

  try {
    const { data, error } = await supabaseAdmin
      .from('khibrati_publications')
      .select('status')

    if (error) {
      console.error('Fetch stats error:', error)
      return res.status(500).json({ error: 'Failed to fetch statistics', details: error.message })
    }

    const stats = {
      total: data.length,
      en_attente: data.filter(p => p.status === 'en_attente').length,
      en_revision: data.filter(p => p.status === 'en_revision').length,
      modifications_demandees: data.filter(p => p.status === 'modifications_demandees').length,
      approuvee: data.filter(p => p.status === 'approuvee').length,
      rejetee: data.filter(p => p.status === 'rejetee').length,
      archivee: data.filter(p => p.status === 'archivee').length,
    }

    return res.json({ data: stats })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// =====================================================
// WILAYAS & COMMUNES ENDPOINTS
// =====================================================

// Algerian Wilayas Data (inline for simplicity)
const ALGERIAN_WILAYAS = [
  { id: '16', code: '16', name: 'Alger', ar_name: 'الجزائر', is_active: true },
  { id: '01', code: '01', name: 'Adrar', ar_name: 'أدرار', is_active: true },
  { id: '02', code: '02', name: 'Chlef', ar_name: 'الشلف', is_active: true },
  { id: '03', code: '03', name: 'Laghouat', ar_name: 'الأغواط', is_active: true },
  { id: '04', code: '04', name: 'Oum El Bouaghi', ar_name: 'أم البواقي', is_active: true },
  { id: '05', code: '05', name: 'Batna', ar_name: 'باتنة', is_active: true },
  { id: '06', code: '06', name: 'Béjaïa', ar_name: 'بجاية', is_active: true },
  { id: '07', code: '07', name: 'Biskra', ar_name: 'بسكرة', is_active: true },
  { id: '08', code: '08', name: 'Béchar', ar_name: 'بشار', is_active: true },
  { id: '09', code: '09', name: 'Blida', ar_name: 'البليدة', is_active: true },
  { id: '10', code: '10', name: 'Bouira', ar_name: 'البويرة', is_active: true },
  { id: '31', code: '31', name: 'Oran', ar_name: 'وهران', is_active: true },
  { id: '25', code: '25', name: 'Constantine', ar_name: 'قسنطينة', is_active: true },
  { id: '23', code: '23', name: 'Annaba', ar_name: 'عنابة', is_active: true },
  { id: '19', code: '19', name: 'Sétif', ar_name: 'سطيف', is_active: true },
]

// Communes by wilaya (sample data - add more as needed)
const ALGERIAN_COMMUNES = {
  '16': [
    { id: '16001', name: 'Bab El Oued', ar_name: 'باب الوادي', wilaya_id: '16', post_code: '16000' },
    { id: '16002', name: 'Alger Centre', ar_name: 'الجزائر الوسطى', wilaya_id: '16', post_code: '16001' },
    { id: '16003', name: 'Bir Mourad Raïs', ar_name: 'بئر مراد رايس', wilaya_id: '16', post_code: '16002' },
    { id: '16004', name: 'Hydra', ar_name: 'حيدرة', wilaya_id: '16', post_code: '16003' },
  ],
  '31': [
    { id: '31001', name: 'Oran', ar_name: 'وهران', wilaya_id: '31', post_code: '31000' },
    { id: '31002', name: 'Bir El Djir', ar_name: 'بئر الجير', wilaya_id: '31', post_code: '31001' },
  ],
}

// Get all wilayas
app.get('/api/admin/wilayas', async (req, res) => {
  try {
    return res.json(ALGERIAN_WILAYAS)
  } catch (error) {
    console.error('Wilayas fetch error:', error)
    return res.status(500).json({ error: error.message })
  }
})

// Get all communes
app.get('/api/admin/communes', async (req, res) => {
  try {
    const { wilaya_id } = req.query
    
    if (wilaya_id) {
      const communes = ALGERIAN_COMMUNES[wilaya_id] || []
      return res.json(communes)
    }
    
    // Return all communes
    const allCommunes = Object.values(ALGERIAN_COMMUNES).flat()
    return res.json(allCommunes)
  } catch (error) {
    console.error('Communes fetch error:', error)
    return res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`)
})
