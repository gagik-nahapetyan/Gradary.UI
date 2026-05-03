import { apiClient } from './client'
import type {
  PagedList,
  PagedRequest,
  UpdatePasswordRequest,
  UserCreateRequest,
  UserDto,
  UserUpdateRequest,
} from '@/types/api'

export const usersApi = {
  getAll: (params: PagedRequest) =>
    apiClient.get<PagedList<UserDto>>('/api/users', { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<UserDto>(`/api/users/${id}`).then((r) => r.data),

  create: (data: UserCreateRequest) =>
    apiClient.post<UserDto>('/api/users', data).then((r) => r.data),

  update: (id: number, data: UserUpdateRequest) =>
    apiClient.put<UserDto>(`/api/users/${id}`, data).then((r) => r.data),

  updatePassword: (id: number, data: UpdatePasswordRequest) =>
    apiClient.put(`/api/users/${id}/password`, data),

  delete: (id: number) =>
    apiClient.delete(`/api/users/${id}`),
}
