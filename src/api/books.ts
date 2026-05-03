import { apiClient } from './client'
import type { BookDto, BookListDto, BookRequest, PagedList, PagedRequest } from '@/types/api'

export interface BooksParams extends PagedRequest {
  categoryId?: number
}

export const booksApi = {
  getAll: (params: BooksParams) =>
    apiClient.get<PagedList<BookListDto>>('/api/books', { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<BookDto>(`/api/books/${id}`).then((r) => r.data),

  create: (data: BookRequest) =>
    apiClient.post<BookDto>('/api/books', data).then((r) => r.data),

  update: (id: number, data: BookRequest) =>
    apiClient.put<BookDto>(`/api/books/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/books/${id}`),

  uploadFile: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`/api/books/${id}/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadImage: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`/api/books/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getImageUrl: (id: number) =>
    `${import.meta.env.VITE_API_BASE_URL}/api/books/${id}/image`,
}
