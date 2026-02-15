import { apiClient } from '@/lib/api-client'
import { z } from 'zod'

// Schema for user management
const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('patient'),
  z.literal('doctor'),
  z.literal('pharmacy'),
  z.literal('association'),
  z.literal('cancer_center'),
  z.literal('laboratory'),
  z.literal('admin'),
])

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  full_name: z.string(),
  avatar_url: z.string().nullable().optional(),
  role: userRoleSchema,
  is_active: z.boolean().or(z.string()).transform(val => val === true || val === 'true'),
  email_verified: z.boolean().or(z.string()).transform(val => val === true || val === 'true').optional(),
  wilaya: z.string().optional(),
  commune: z.string().optional(),
  phone: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
}).passthrough()

export type AdminUser = z.infer<typeof adminUserSchema>

export interface GetUsersParams {
  page?: number
  pageSize?: number
  search?: string
  role?: string[]
  status?: string[]
}

export interface UsersResponse {
  data: AdminUser[]
  total: number
  page: number
  pageSize: number
}

export interface CreateAdminUserPayload {
  email: string
  full_name: string
  role?: string
  phone?: string | null
  wilaya: string
  commune: string
  language?: string
  avatar_url?: string | null
  avatar?: {
    data: string
    name: string
    type: string
  }
  is_active?: boolean
  password?: string
}

export interface UpdateAdminUserPayload {
  full_name?: string
  email?: string
  role?: string
  phone?: string | null
  wilaya?: string
  commune?: string
  language?: string
  avatar_url?: string | null
  avatar?: {
    data: string
    name: string
    type: string
  }
  is_active?: boolean
}

class AdminUsersService {
  /**
   * Fetch all users with pagination and filters
   */
  async getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
    try {
      const response = await apiClient.instance.get('/admin/users', {
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          search: params.search,
          role: params.role?.join(','),
          status: params.status?.join(','),
        },
      })

      return {
        data: (response.data.data || []).map((user: any) => adminUserSchema.parse(user)),
        total: response.data.total || 0,
        page: response.data.page || 1,
        pageSize: response.data.pageSize || 10,
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<AdminUser> {
    try {
      const response = await apiClient.instance.get(`/admin/users?id=${userId}`)
      return adminUserSchema.parse(response.data[0])
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    try {
      const response = await apiClient.instance.patch(`/admin/users/${userId}`, {
        role,
      })
      return adminUserSchema.parse(response.data.data)
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, is_active: boolean): Promise<void> {
    try {
      await apiClient.instance.patch(`/admin/users/${userId}`, {
        is_active,
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }

  /**
   * Suspend a user
   */
  async suspendUser(userId: string): Promise<void> {
    return this.updateUserStatus(userId, false)
  }

  /**
   * Activate a user
   */
  async activateUser(userId: string): Promise<void> {
    return this.updateUserStatus(userId, true)
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.instance.delete(`/admin/users/${userId}`)
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  /**
   * Update user profile fields
   */
  async updateUser(userId: string, payload: UpdateAdminUserPayload): Promise<AdminUser> {
    try {
      const response = await apiClient.instance.patch(`/admin/users/${userId}`, payload)
      return adminUserSchema.parse(response.data.data)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
  }> {
    try {
      const response = await apiClient.instance.get('/admin/users?select=count()')
      return response.data
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }
  }

  /**
   * Create a new user
   */
  async createUser(payload: CreateAdminUserPayload): Promise<{ user: AdminUser; tempPassword?: string }> {
    try {
      const response = await apiClient.instance.post('/admin/users', payload)
      return {
        user: adminUserSchema.parse(response.data.data),
        tempPassword: response.data.tempPassword,
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }
}

export const adminUsersService = new AdminUsersService()
