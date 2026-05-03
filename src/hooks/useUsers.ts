import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import type { PagedRequest, UpdatePasswordRequest, UserCreateRequest, UserUpdateRequest } from '@/types/api'

export const userKeys = {
  all: ['users'] as const,
  list: (params: PagedRequest) => ['users', 'list', params] as const,
  detail: (id: number) => ['users', id] as const,
}

export function useUsers(params: PagedRequest) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getAll(params),
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserCreateRequest) => usersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserUpdateRequest) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all })
      qc.invalidateQueries({ queryKey: userKeys.detail(id) })
    },
  })
}

export function useUpdatePassword(id: number) {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => usersApi.updatePassword(id, data),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}
