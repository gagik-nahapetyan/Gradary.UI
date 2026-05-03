import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { collectionsApi } from '@/api/collections'
import type {
  BookCollectionItemRequest,
  BookCollectionRequest,
} from '@/types/api'

export const collectionKeys = {
  all: ['collections'] as const,
  list: () => ['collections', 'list'] as const,
  detail: (id: number) => ['collections', id] as const,
}

export function useCollections() {
  return useQuery({
    queryKey: collectionKeys.list(),
    queryFn: () => collectionsApi.getMyCollections(),
  })
}

export function useCollection(id: number) {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: () => collectionsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookCollectionRequest) => collectionsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: collectionKeys.all }),
  })
}

export function useUpdateCollection(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookCollectionRequest) => collectionsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collectionKeys.all })
      qc.invalidateQueries({ queryKey: collectionKeys.detail(id) })
    },
  })
}

export function useDeleteCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => collectionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: collectionKeys.all }),
  })
}

export function useAddBookToCollection(collectionId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BookCollectionItemRequest) =>
      collectionsApi.addBook(collectionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) }),
  })
}

export function useUpdateCollectionBook(collectionId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookId,
      data,
    }: {
      bookId: number
      data: Partial<BookCollectionItemRequest>
    }) => collectionsApi.updateBook(collectionId, bookId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) }),
  })
}

export function useRemoveBookFromCollection(collectionId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (bookId: number) => collectionsApi.removeBook(collectionId, bookId),
    onSuccess: () => qc.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) }),
  })
}
