import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authorsApi } from '@/api/authors'
import type { AuthorRequest, PagedRequest } from '@/types/api'

export const authorKeys = {
  all: ['authors'] as const,
  list: (params?: PagedRequest) => ['authors', 'list', params] as const,
  detail: (id: number) => ['authors', id] as const,
  books: (id: number, params?: PagedRequest) => ['authors', id, 'books', params] as const,
}

export function useAuthors(params: PagedRequest) {
  return useQuery({
    queryKey: authorKeys.list(params),
    queryFn: () => authorsApi.getAll(params),
  })
}

export function useAuthor(id: number) {
  return useQuery({
    queryKey: authorKeys.detail(id),
    queryFn: () => authorsApi.getById(id),
    enabled: !!id,
  })
}

export function useAuthorBooks(id: number, params: PagedRequest) {
  return useQuery({
    queryKey: authorKeys.books(id, params),
    queryFn: () => authorsApi.getBooks(id, params),
    enabled: !!id,
  })
}

export function useUploadAuthorImage(authorId: number) {
  return useMutation({
    mutationFn: (file: File) => authorsApi.uploadImage(authorId, file),
  })
}

export function useCreateAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AuthorRequest) => authorsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: authorKeys.all }),
  })
}

export function useUpdateAuthor(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AuthorRequest) => authorsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authorKeys.all })
      qc.invalidateQueries({ queryKey: authorKeys.detail(id) })
    },
  })
}

export function useDeleteAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => authorsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: authorKeys.all }),
  })
}
