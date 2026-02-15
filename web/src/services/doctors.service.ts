import { apiClient } from '@/lib/api-client'
import { z } from 'zod'

const doctorSchema = z
  .object({
    id: z.string(),
    userId: z.string().nullable().optional(),
    name: z.string(),
    email: z.string().email().or(z.string()),
    phone: z.string().nullable().optional(),
    wilaya: z.string().nullable().optional(),
    commune: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    specialization: z.string(),
    licenseNumber: z.string(),
    hospitalAffiliation: z.string().nullable().optional(),
    consultationFee: z.number().nullable().optional(),
    yearsOfExperience: z.number().nullable().optional(),
    education: z.array(z.any()).nullable().optional(),
    certifications: z.array(z.any()).nullable().optional(),
    languagesSpoken: z.array(z.string()).nullable().optional(),
    acceptsNewPatients: z.boolean().optional(),
    status: z.string().nullable().optional(),
    registrationDate: z.string().nullable().optional(),
    createdAt: z.string().nullable().optional(),
    updatedAt: z.string().nullable().optional(),
  })
  .transform((doctor) => ({
    ...doctor,
    acceptsNewPatients: doctor.acceptsNewPatients ?? true,
    status: (doctor.status || 'pending') as 'pending' | 'approved' | 'rejected',
  }))

export type Doctor = z.infer<typeof doctorSchema>

export interface CreateDoctorPayload {
  name: string
  email: string
  phone?: string
  wilaya: string
  commune: string
  language?: string
  bio?: string
  specialization: string
  licenseNumber: string
  hospitalAffiliation?: string
  consultationFee?: number | string | null
  yearsOfExperience?: number | string | null
  education?: string[]
  certifications?: string[]
  languagesSpoken?: string[]
  acceptsNewPatients?: boolean
  password?: string
  avatar?: {
    data: string
    name: string
    type: string
  }
}

export interface UpdateDoctorPayload {
  name?: string
  email?: string
  phone?: string | null
  wilaya?: string
  commune?: string
  language?: string
  bio?: string | null
  specialization?: string
  licenseNumber?: string
  hospitalAffiliation?: string | null
  consultationFee?: number | string | null
  yearsOfExperience?: number | string | null
  education?: string[] | string | null
  certifications?: string[] | string | null
  languagesSpoken?: string[] | string | null
  acceptsNewPatients?: boolean
  avatar?: {
    data: string
    name: string
    type: string
  }
}

export class DoctorsService {
  async getDoctors(params: { search?: string; status?: string } = {}): Promise<Doctor[]> {
    const response = await apiClient.instance.get('/admin/doctors', {
      params: {
        search: params.search,
        status: params.status,
      },
    })

    const doctors = Array.isArray(response.data?.data) ? response.data.data : []
    return doctors.map((doctor: unknown) => doctorSchema.parse(doctor))
  }

  async createDoctor(payload: CreateDoctorPayload): Promise<{ doctor: Doctor; tempPassword?: string }> {
    const response = await apiClient.instance.post('/admin/doctors', payload)
    return {
      doctor: doctorSchema.parse(response.data?.data),
      tempPassword: response.data?.tempPassword,
    }
  }

  async updateDoctorStatus(doctorId: string, status: 'approved' | 'pending' | 'rejected'): Promise<Doctor> {
    const response = await apiClient.instance.patch(`/admin/doctors/${doctorId}/status`, { status })
    return doctorSchema.parse(response.data?.data)
  }

  async updateDoctor(doctorId: string, payload: UpdateDoctorPayload): Promise<Doctor> {
    const response = await apiClient.instance.patch(`/admin/doctors/${doctorId}`, payload)
    return doctorSchema.parse(response.data?.data)
  }

  async deleteDoctor(doctorId: string): Promise<void> {
    await apiClient.instance.delete(`/admin/doctors/${doctorId}`)
  }
}

export const doctorsService = new DoctorsService()
