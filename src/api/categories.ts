import { apiClient } from './client'
import type { CategoryDto, CategoryRequest } from '@/types/api'

export const categoriesApi = {
  getAll: () =>
    apiClient.get<CategoryDto[]>('/api/categories').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<CategoryDto>(`/api/categories/${id}`).then((r) => r.data),

  create: (data: CategoryRequest) =>
    apiClient.post<CategoryDto>('/api/categories', data).then((r) => r.data),

  update: (id: number, data: CategoryRequest) =>
    apiClient.put<CategoryDto>(`/api/categories/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/categories/${id}`),
}
