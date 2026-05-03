import { apiClient } from './client'
import type { PagedList, PagedRequest, ReviewDto, ReviewRequest } from '@/types/api'

export const reviewsApi = {
  getByBook: (bookId: number, params: PagedRequest) =>
    apiClient
      .get<PagedList<ReviewDto>>(`/api/reviews/book/${bookId}`, { params })
      .then((r) => r.data),

  create: (data: ReviewRequest) =>
    apiClient.post<ReviewDto>('/api/reviews', data).then((r) => r.data),

  update: (id: number, data: ReviewRequest) =>
    apiClient.put<ReviewDto>(`/api/reviews/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/reviews/${id}`),
}
