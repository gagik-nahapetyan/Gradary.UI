import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useBook, useCreateBook, useUpdateBook } from '@/hooks/useBooks'
import { useAuthors } from '@/hooks/useAuthors'
import { useCategories } from '@/hooks/useCategories'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Card, CardContent } from '@/components/ui/card'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  authorId: z.coerce.number().min(1, 'Author is required'),
  categoryId: z.coerce.number().min(1, 'Category is required'),
})
type FormValues = z.infer<typeof schema>

export function BookFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const bookId = Number(id)
  const navigate = useNavigate()

  const { data: book } = useBook(bookId)
  const { data: authorsData } = useAuthors({ page: 1, pageSize: 100 })
  const { data: categoriesData } = useCategories()

  const createBook = useCreateBook()
  const updateBook = useUpdateBook(bookId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', subtitle: '', description: '', authorId: 0, categoryId: 0 },
  })

  useEffect(() => {
    if (book && isEdit) {
      form.reset({
        title: book.title,
        subtitle: book.subtitle ?? '',
        description: book.description ?? '',
        authorId: book.authorId,
        categoryId: book.categoryId,
      })
    }
  }, [book, isEdit, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await updateBook.mutateAsync(values)
        toast.success('Book updated')
        navigate(`/books/${bookId}`)
      } else {
        const created = await createBook.mutateAsync(values)
        toast.success('Book created')
        navigate(`/books/${created.id}`)
      }
    } catch {
      toast.error(isEdit ? 'Failed to update book' : 'Failed to create book')
    }
  }

  const isPending = createBook.isPending || updateBook.isPending

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Book' : 'Add Book'} />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
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
                    <FormControl><Textarea rows={4} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="authorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select author" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {authorsData?.items?.map((a) => (
                          <SelectItem key={a.id} value={a.id.toString()}>
                            {a.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : ''}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesData?.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.parentName ? `${c.parentName} / ${c.name}` : c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Book'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
