import { apiClient } from '@/lib/api-client'
import { AdminUser } from '@/services/admin-users.service'

export const adminUsersApi = {
  /**
   * Fetch all users with pagination and filters
   */
  async getUsers(params: {
    page?: number
    pageSize?: number
    search?: string
    role?: string
    status?: string
  }) {
    const { data } = await apiClient.instance.get('/admin/users', { params })
    return data
  },

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string) {
    const { data } = await apiClient.instance.get(`/admin/users/${userId}`)
    return data as AdminUser
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string) {
    const { data } = await apiClient.instance.patch(`/admin/users/${userId}/role`, { role })
    return data as AdminUser
  },

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: string) {
    const { data } = await apiClient.instance.patch(`/admin/users/${userId}/status`, {
      status,
    })
    return data as AdminUser
  },

  /**
   * Delete a user
   */
  async deleteUser(userId: string) {
    await apiClient.instance.delete(`/admin/users/${userId}`)
  },

  /**
   * Get user statistics
   */
  async getUserStats() {
    const { data } = await apiClient.instance.get('/admin/users/stats')
    return data
  },
}
