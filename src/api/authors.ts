import { apiClient } from './client'
import type { AuthorDto, AuthorRequest, BookListDto, PagedList, PagedRequest } from '@/types/api'

export const authorsApi = {
  getAll: (params: PagedRequest) =>
    apiClient.get<PagedList<AuthorDto>>('/api/authors', { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<AuthorDto>(`/api/authors/${id}`).then((r) => r.data),

  getBooks: (id: number, params: PagedRequest) =>
    apiClient.get<PagedList<BookListDto>>(`/api/books/author/${id}`, { params }).then((r) => r.data),

  create: (data: AuthorRequest) =>
    apiClient.post<AuthorDto>('/api/authors', data).then((r) => r.data),

  update: (id: number, data: AuthorRequest) =>
    apiClient.put<AuthorDto>(`/api/authors/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/authors/${id}`),

  uploadImage: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`/api/authors/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getImageUrl: (id: number) =>
    `${import.meta.env.VITE_API_BASE_URL}/api/authors/${id}/image`,
}
