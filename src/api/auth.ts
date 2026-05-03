import { apiClient } from './client'
import type { LoginRequest, LoginResponse, RegisterRequest, UserDto } from '@/types/api'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<UserDto>('/api/auth/register', data).then((r) => r.data),
}
