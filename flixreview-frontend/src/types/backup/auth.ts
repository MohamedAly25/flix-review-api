export interface User {
  id: number
  email: string
  username: string
  first_name?: string
  last_name?: string
  is_staff: boolean
  is_active: boolean
  date_joined: string
  last_login?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  first_name?: string
  last_name?: string
}

export interface TokenResponse {
  access: string
  refresh: string
  user: User
}

export interface PasswordChange {
  old_password: string
  new_password: string
}
