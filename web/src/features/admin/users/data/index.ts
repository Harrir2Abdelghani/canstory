export const adminRoles = [
  { label: 'Superadmin', value: 'superadmin' },
  { label: 'Admin', value: 'admin' },
  { label: 'Doctor', value: 'doctor' },
  { label: 'Pharmacy', value: 'pharmacy' },
  { label: 'Patient', value: 'patient' },
  { label: 'Association', value: 'association' },
] as const

export const userStatuses = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Invited', value: 'invited' },
] as const
