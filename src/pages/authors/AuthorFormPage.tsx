import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuthor, useCreateAuthor, useUpdateAuthor } from '@/hooks/useAuthors'
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
import { Card, CardContent } from '@/components/ui/card'

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  biography: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function AuthorFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const authorId = Number(id)
  const navigate = useNavigate()

  const { data: author } = useAuthor(authorId)
  const createAuthor = useCreateAuthor()
  const updateAuthor = useUpdateAuthor(authorId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', biography: '' },
  })

  useEffect(() => {
    if (author && isEdit) {
      form.reset({ fullName: author.fullName, biography: author.biography ?? '' })
    }
  }, [author, isEdit, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await updateAuthor.mutateAsync(values)
        toast.success('Author updated')
        navigate(`/authors/${authorId}`)
      } else {
        const created = await createAuthor.mutateAsync(values)
        toast.success('Author created')
        navigate(`/authors/${created.id}`)
      }
    } catch {
      toast.error(isEdit ? 'Failed to update author' : 'Failed to create author')
    }
  }

  const isPending = createAuthor.isPending || updateAuthor.isPending

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Author' : 'Add Author'} />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="biography"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl><Textarea rows={5} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Author'}
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
