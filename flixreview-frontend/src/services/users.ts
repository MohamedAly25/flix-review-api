import apiClient from '@/lib/api/client'
import { User, UserList, UserListItem } from '@/types/auth'

export const usersService = {
  /**
   * Get list of all users (paginated, searchable)
   */
  async getUsers(params?: {
    search?: string
    page?: number
    page_size?: number
  }): Promise<UserList> {
    const response = await apiClient.get('/users/', { params })
    return response.data.data || response.data
  },

  /**
   * Get a specific user's public profile by username
   */
  async getUserByUsername(username: string): Promise<User> {
    const response = await apiClient.get(`/users/${username}/`)
    return response.data.data || response.data
  },

  /**
   * Search users by username, first_name, or last_name
   */
  async searchUsers(query: string): Promise<UserList> {
    const response = await apiClient.get('/users/', {
      params: { search: query },
    })
    return response.data.data || response.data
  },
}
