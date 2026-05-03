import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCategories, useDeleteCategory } from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
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

export function CategoriesPage() {
  const { hasRole } = useAuth()
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()
  const canEdit = hasRole('Admin', 'Librarian')

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCategory.mutateAsync(deleteId)
      toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeleteId(null)
    }
  }

  // Build a lookup map for parent names
  const parentMap = new Map(data?.map((c) => [c.id, c.name]) ?? [])

  return (
    <div>
      <PageHeader
        title="Categories"
        action={
          canEdit ? (
            <Button asChild size="sm">
              <Link to="/categories/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Description</TableHead>
              {canEdit && <TableHead className="w-24 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    {canEdit && <TableCell />}
                  </TableRow>
                ))
              : data?.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {cat.parentId ? (parentMap.get(cat.parentId) ?? `#${cat.parentId}`) : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {cat.description ?? '—'}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/categories/${cat.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDeleteId(cat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={canEdit ? 4 : 3} className="text-center text-muted-foreground py-8">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete category"
        description="This will permanently delete the category."
        onConfirm={handleDelete}
        loading={deleteCategory.isPending}
      />
    </div>
  )
}
