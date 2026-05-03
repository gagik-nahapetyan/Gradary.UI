import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCollections, useCreateCollection, useDeleteCollection } from '@/hooks/useCollections'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { COLLECTION_STATUS_LABELS, type BookCollectionStatus } from '@/types/api'


const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['NotStarted', 'InProgress', 'Completed', 'Archived']),
})
type FormValues = z.infer<typeof schema>

const statusVariant: Record<BookCollectionStatus, 'default' | 'info' | 'success' | 'secondary'> = {
  NotStarted: 'secondary',
  InProgress: 'info',
  Completed: 'success',
  Archived: 'secondary',
}

export function CollectionsPage() {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading } = useCollections()
  const createCollection = useCreateCollection()
  const deleteCollection = useDeleteCollection()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', status: 'NotStarted' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const created = await createCollection.mutateAsync(values)
      toast.success('Collection created')
      setDialogOpen(false)
      form.reset()
      navigate(`/collections/${created.id}`)
    } catch {
      toast.error('Failed to create collection')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCollection.mutateAsync(deleteId)
      toast.success('Collection deleted')
    } catch {
      toast.error('Failed to delete collection')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="My Collections"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea rows={2} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(COLLECTION_STATUS_LABELS).map(([val, label]) => (
                              <SelectItem key={val} value={val}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCollection.isPending}>
                      {createCollection.isPending ? 'Creating…' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Books</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              : data?.map((col) => (
                  <TableRow
                    key={col.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/collections/${col.id}`)}
                  >
                    <TableCell className="font-medium">{col.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[col.status]}>
                        {COLLECTION_STATUS_LABELS[col.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {col.items.length}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(col.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No collections yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete collection"
        description="This will permanently delete the collection and all its items."
        onConfirm={handleDelete}
        loading={deleteCollection.isPending}
      />
    </div>
  )
}
