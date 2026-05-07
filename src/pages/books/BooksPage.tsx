import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useBooks, useDeleteBook } from '@/hooks/useBooks'
import { booksApi } from '@/api/books'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { SortableHeader } from '@/components/shared/SortableHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export function BooksPage() {
  const { hasRole } = useAuth()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [orderBy, setOrderBy] = useState<string | undefined>()
  const [orderType, setOrderType] = useState<OrderType | undefined>()
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useBooks({ page, pageSize: PAGE_SIZE, orderBy, orderType, categoryId })
  const { data: categoriesData } = useCategories()
  const deleteBook = useDeleteBook()

  const handleSort = (field: string, type: OrderType) => {
    setOrderBy(field)
    setOrderType(type)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteBook.mutateAsync(deleteId)
      toast.success('Book deleted')
    } catch {
      toast.error('Failed to delete book')
    } finally {
      setDeleteId(null)
    }
  }

  const canEdit = hasRole('Admin', 'Librarian')

  return (
    <div>
      <PageHeader
        title="Books"
        action={
          canEdit ? (
            <Button asChild size="sm">
              <Link to="/books/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <Select
          value={categoryId?.toString() ?? 'all'}
          onValueChange={(val) => {
            setCategoryId(val === 'all' ? undefined : Number(val))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoriesData?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>
                <SortableHeader
                  label="Title"
                  field="title"
                  currentOrderBy={orderBy}
                  currentOrderType={orderType}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              {canEdit && <TableHead className="w-24 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-9 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    {canEdit && <TableCell />}
                  </TableRow>
                ))
              : data?.items?.map((book) => (
                  <TableRow
                    key={book.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    <TableCell>
                      {book.imageUrl ? (
                        <div className="h-12 w-9 rounded overflow-hidden shrink-0">
                          <img
                            src={booksApi.getImageUrl(book.id)}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-9 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {book.authorName ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {book.categoryName ?? '—'}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/books/${book.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDeleteId(book.id)}
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
                <TableCell colSpan={canEdit ? 5 : 4} className="text-center text-muted-foreground py-8">
                  No books found.
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
        title="Delete book"
        description="This will permanently delete the book. This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteBook.isPending}
      />
    </div>
  )
}
