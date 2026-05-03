import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Pencil, Plus, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCollection,
  useUpdateCollection,
  useAddBookToCollection,
  useUpdateCollectionBook,
  useRemoveBookFromCollection,
} from '@/hooks/useCollections'
import { useBooks } from '@/hooks/useBooks'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  COLLECTION_STATUS_LABELS,
  ITEM_STATUS_LABELS,
  type BookCollectionItemStatus,
  type BookCollectionStatus,
} from '@/types/api'

const statusVariant: Record<BookCollectionItemStatus, 'default' | 'info' | 'success' | 'secondary' | 'warning'> = {
  WantToRead: 'secondary',
  Reading: 'info',
  Finished: 'success',
  Dropped: 'warning',
}

const addBookSchema = z.object({
  bookId: z.coerce.number().min(1, 'Select a book'),
  status: z.enum(['WantToRead', 'Reading', 'Finished', 'Dropped']),
  position: z.coerce.number().min(1),
})
type AddBookValues = z.infer<typeof addBookSchema>

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const collectionId = Number(id)
  const navigate = useNavigate()

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editStatusBookId, setEditStatusBookId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState<BookCollectionItemStatus>('WantToRead')
  const [removeBookId, setRemoveBookId] = useState<number | null>(null)

  const { data: collection, isLoading } = useCollection(collectionId)
  const { data: booksData } = useBooks({ page: 1, pageSize: 200 })

  const updateCollection = useUpdateCollection(collectionId)
  const addBook = useAddBookToCollection(collectionId)
  const updateBook = useUpdateCollectionBook(collectionId)
  const removeBook = useRemoveBookFromCollection(collectionId)

  const addForm = useForm<AddBookValues>({
    resolver: zodResolver(addBookSchema),
    defaultValues: { bookId: 0, status: 'WantToRead', position: (collection?.items.length ?? 0) + 1 },
  })

  const handleAddBook = async (values: AddBookValues) => {
    try {
      await addBook.mutateAsync(values)
      toast.success('Book added to collection')
      setAddDialogOpen(false)
      addForm.reset()
    } catch {
      toast.error('Failed to add book')
    }
  }

  const handleUpdateStatus = async () => {
    if (!editStatusBookId) return
    try {
      const item = collection?.items.find((i) => i.bookId === editStatusBookId)
      if (!item) return
      await updateBook.mutateAsync({ bookId: editStatusBookId, data: { status: editStatus, position: item.position } })
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setEditStatusBookId(null)
    }
  }

  const handleRemoveBook = async () => {
    if (!removeBookId) return
    try {
      await removeBook.mutateAsync(removeBookId)
      toast.success('Book removed')
    } catch {
      toast.error('Failed to remove book')
    } finally {
      setRemoveBookId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!collection) return <p className="text-muted-foreground">Collection not found.</p>

  return (
    <div className="space-y-6">
      <PageHeader
        title={collection.name}
        description={collection.description}
        action={
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{COLLECTION_STATUS_LABELS[collection.status]}</Badge>
            <Button size="sm" variant="outline" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </div>
        }
      />

      {/* Items table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Book</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collection.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No books in this collection yet.
                </TableCell>
              </TableRow>
            ) : (
              [...collection.items]
                .sort((a, b) => a.position - b.position)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.position}</TableCell>
                    <TableCell>
                      <Link
                        to={`/books/${item.bookId}`}
                        className="font-medium hover:underline text-primary"
                      >
                        {item.bookTitle ?? `Book #${item.bookId}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {editStatusBookId === item.bookId ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={editStatus}
                            onValueChange={(v) => setEditStatus(v as BookCollectionItemStatus)}
                          >
                            <SelectTrigger className="h-8 w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ITEM_STATUS_LABELS).map(([val, label]) => (
                                <SelectItem key={val} value={val}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleUpdateStatus}
                            disabled={updateBook.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          variant={statusVariant[item.status]}
                          className="cursor-pointer"
                          onClick={() => {
                            setEditStatusBookId(item.bookId)
                            setEditStatus(item.status)
                          }}
                        >
                          {ITEM_STATUS_LABELS[item.status]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive h-8 w-8"
                        onClick={() => setRemoveBookId(item.bookId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add book dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Book to Collection</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddBook)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="bookId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a book" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {booksData?.items
                          .filter((b) => !collection.items.some((i) => i.bookId === b.id))
                          .map((b) => (
                            <SelectItem key={b.id} value={b.id.toString()}>
                              {b.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
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
                        {Object.entries(ITEM_STATUS_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addBook.isPending}>
                  {addBook.isPending ? 'Adding…' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={removeBookId !== null}
        onOpenChange={(open) => !open && setRemoveBookId(null)}
        title="Remove book"
        description="Remove this book from the collection?"
        onConfirm={handleRemoveBook}
        loading={removeBook.isPending}
      />
    </div>
  )
}
