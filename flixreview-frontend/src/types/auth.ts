// TypeScript types matching Django models exactly
// Reference: flix-review-api/accounts/models.py + serializers.py

// User type matching UserProfileSerializer
export interface User {
  id: number
  email: string
  username: string
  first_name?: string
  last_name?: string
  bio?: string | null
  profile_picture?: string | null
  profile_picture_url?: string | null
}

// Login credentials for CustomTokenObtainPairSerializer
export interface LoginCredentials {
  email: string
  password: string
}

// Registration data matching UserRegistrationSerializer
export interface RegisterData {
  email: string
  username: string
  password: string
  password_confirm: string  // Required field
  first_name?: string
  last_name?: string
  bio?: string
  profile_picture?: File | null
}

// Token response from CustomTokenObtainPairSerializer.validate()
export interface TokenResponse {
  access: string
  refresh: string
  user_id: number      // Added by custom serializer
  username: string     // Added by custom serializer
  email: string        // Added by custom serializer
}

// User profile update matching UserProfileSerializer
export interface UserProfileUpdate {
  username?: string
  first_name?: string
  last_name?: string
  bio?: string
  profile_picture?: File | null
  // Note: email is read_only in serializer
}

// Password change data
export interface PasswordChange {
  old_password: string
  new_password: string
  new_password_confirm: string
}
