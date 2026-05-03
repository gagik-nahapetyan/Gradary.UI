import { apiClient } from './client'
import type {
  BookCollectionDto,
  BookCollectionItemRequest,
  BookCollectionRequest,
} from '@/types/api'

export const collectionsApi = {
  // Backend returns a plain array (no pagination) for the current user's collections
  getMyCollections: () =>
    apiClient.get<BookCollectionDto[]>('/api/collections').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<BookCollectionDto>(`/api/collections/${id}`).then((r) => r.data),

  create: (data: BookCollectionRequest) =>
    apiClient.post<BookCollectionDto>('/api/collections', data).then((r) => r.data),

  update: (id: number, data: BookCollectionRequest) =>
    apiClient.put<BookCollectionDto>(`/api/collections/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/collections/${id}`),

  addBook: (collectionId: number, data: BookCollectionItemRequest) =>
    apiClient
      .post(`/api/collections/${collectionId}/books`, data)
      .then((r) => r.data),

  updateBook: (collectionId: number, bookId: number, data: Partial<BookCollectionItemRequest>) =>
    apiClient
      .put(`/api/collections/${collectionId}/books/${bookId}`, data)
      .then((r) => r.data),

  removeBook: (collectionId: number, bookId: number) =>
    apiClient.delete(`/api/collections/${collectionId}/books/${bookId}`),
}
