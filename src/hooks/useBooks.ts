import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { booksApi, type BooksParams } from '@/api/books'
import type { BookRequest } from '@/types/api'

export const bookKeys = {
  all: ['books'] as const,
  list: (params: BooksParams) => ['books', 'list', params] as const,
  detail: (id: number) => ['books', id] as const,
}

export function useBooks(params: BooksParams) {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => booksApi.getAll(params),
  })
}

export function useBook(id: number) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => booksApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookRequest) => booksApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookKeys.all }),
  })
}

export function useUpdateBook(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookRequest) => booksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookKeys.all })
      qc.invalidateQueries({ queryKey: bookKeys.detail(id) })
    },
  })
}

export function useDeleteBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => booksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookKeys.all }),
  })
}

export function useUploadBookFile(bookId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => booksApi.uploadFile(bookId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookKeys.detail(bookId) }),
  })
}

export function useUploadBookImage(bookId: number) {
  return useMutation({
    mutationFn: (file: File) => booksApi.uploadImage(bookId, file),
  })
}
