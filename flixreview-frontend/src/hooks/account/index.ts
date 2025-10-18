import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth'
import { useAuth } from '@/contexts/AuthContext'

export function useChangePassword() {
  const queryClient = useQueryClient()
  const { logout } = useAuth()

  return useMutation({
    mutationFn: (data: {
      current_password: string
      new_password: string
      new_password_confirm: string
    }) => authService.changePassword(data),
    onSuccess: () => {
      // Optionally invalidate user data
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
    onError: (error) => {
      console.error('Password change failed:', error)
    },
  })
}

export function useDeleteAccount() {
  const { logout } = useAuth()

  return useMutation({
    mutationFn: (password: string) => authService.deleteAccount(password),
    onSuccess: async () => {
      // Automatically logout after account deletion
      try {
        await logout()
      } catch (error) {
        console.error('Logout after account deletion failed:', error)
      }
    },
    onError: (error) => {
      console.error('Account deletion failed:', error)
    },
  })
}

export function useUpdateProfilePicture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('profile_picture', file)
      return authService.updateProfile(formData)
    },
    onSuccess: (updatedUser) => {
      // Update cached user data
      queryClient.setQueryData(['currentUser'], updatedUser)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      console.error('Profile picture update failed:', error)
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      username?: string
      first_name?: string
      last_name?: string
      bio?: string
    }) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update cached user data
      queryClient.setQueryData(['currentUser'], updatedUser)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      console.error('Profile update failed:', error)
    },
  })
}