import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '@/api/categories'
import type { CategoryRequest } from '@/types/api'

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => ['categories', 'list'] as const,
  detail: (id: number) => ['categories', id] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoriesApi.getAll(),
  })
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryRequest) => categoriesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export function useUpdateCategory(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryRequest) => categoriesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all })
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}
