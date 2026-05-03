import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '@/api/reviews'
import type { PagedRequest, ReviewRequest } from '@/types/api'

export const reviewKeys = {
  all: ['reviews'] as const,
  byBook: (bookId: number, params: PagedRequest) => ['reviews', 'book', bookId, params] as const,
}

export function useBookReviews(bookId: number, params: PagedRequest) {
  return useQuery({
    queryKey: reviewKeys.byBook(bookId, params),
    queryFn: () => reviewsApi.getByBook(bookId, params),
    enabled: !!bookId,
  })
}

export function useCreateReview(bookId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReviewRequest) => reviewsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', 'book', bookId] }),
  })
}

export function useUpdateReview(bookId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReviewRequest }) =>
      reviewsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', 'book', bookId] }),
  })
}

export function useDeleteReview(bookId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reviewsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', 'book', bookId] }),
  })
}
