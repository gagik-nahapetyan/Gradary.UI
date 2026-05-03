import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUsers, useDeleteUser } from '@/hooks/useUsers'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { SortableHeader } from '@/components/shared/SortableHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { OrderType, UserRole } from '@/types/api'

const PAGE_SIZE = 15

const roleBadgeVariant: Record<UserRole, 'default' | 'secondary' | 'info'> = {
  Admin: 'default',
  Librarian: 'info',
  Member: 'secondary',
}

export function UsersPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [orderBy, setOrderBy] = useState<string | undefined>()
  const [orderType, setOrderType] = useState<OrderType | undefined>()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading } = useUsers({ page, pageSize: PAGE_SIZE, orderBy, orderType })
  const deleteUser = useDeleteUser()

  const handleSort = (field: string, type: OrderType) => {
    setOrderBy(field)
    setOrderType(type)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteUser.mutateAsync(deleteId)
      toast.success('User deleted')
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        action={
          isAdmin ? (
            <Button asChild size="sm">
              <Link to="/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader
                  label="Name"
                  field="fullName"
                  currentOrderBy={orderBy}
                  currentOrderType={orderType}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Email"
                  field="email"
                  currentOrderBy={orderBy}
                  currentOrderType={orderType}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Role"
                  field="role"
                  currentOrderBy={orderBy}
                  currentOrderType={orderType}
                  onSort={handleSort}
                />
              </TableHead>
              {isAdmin && <TableHead className="w-24 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    {isAdmin && <TableCell />}
                  </TableRow>
                ))
              : data?.items?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant[user.role]}>{user.role}</Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDeleteId(user.id)}
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
                <TableCell colSpan={isAdmin ? 4 : 3} className="text-center text-muted-foreground py-8">
                  No users found.
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
        title="Delete user"
        description="This will permanently delete the user account."
        onConfirm={handleDelete}
        loading={deleteUser.isPending}
      />
    </div>
  )
}
