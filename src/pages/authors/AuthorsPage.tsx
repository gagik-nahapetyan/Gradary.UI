import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthors, useDeleteAuthor } from '@/hooks/useAuthors'
import { authorsApi } from '@/api/authors'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { SortableHeader } from '@/components/shared/SortableHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { OrderType } from '@/types/api'

const PAGE_SIZE = 10

export function AuthorsPage() {
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [orderBy, setOrderBy] = useState<string | undefined>()
  const [orderType, setOrderType] = useState<OrderType | undefined>()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useAuthors({ page, pageSize: PAGE_SIZE, orderBy, orderType })
  const deleteAuthor = useDeleteAuthor()
  const canEdit = hasRole('Admin', 'Librarian')

  const handleSort = (field: string, type: OrderType) => {
    setOrderBy(field)
    setOrderType(type)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteAuthor.mutateAsync(deleteId)
      toast.success('Author deleted')
    } catch {
      toast.error('Failed to delete author')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Authors"
        action={
          canEdit ? (
            <Button asChild size="sm">
              <Link to="/authors/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Author
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>
                <SortableHeader
                  label="Name"
                  field="fullName"
                  currentOrderBy={orderBy}
                  currentOrderType={orderType}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Biography</TableHead>
              {canEdit && <TableHead className="w-24 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                    {canEdit && <TableCell />}
                  </TableRow>
                ))
              : data?.items?.map((author) => (
                  <TableRow
                    key={author.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/authors/${author.id}`)}
                  >
                    <TableCell>
                      {author.imageUrl ? (
                        <img
                          src={authorsApi.getImageUrl(author.id)}
                          alt={author.fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                          {author.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{author.fullName}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {author.biography ?? '—'}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/authors/${author.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDeleteId(author.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            {!isLoading && (data?.items?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={canEdit ? 4 : 3} className="text-center text-muted-foreground py-8">
                  No authors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete author"
        description="This will permanently delete the author."
        onConfirm={handleDelete}
        loading={deleteAuthor.isPending}
      />
    </div>
  )
}
