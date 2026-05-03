import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCategory, useCreateCategory, useUpdateCategory } from '@/hooks/useCategories'
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
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentId: z.coerce.number().optional(),
})
type FormValues = z.infer<typeof schema>

export function CategoryFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const categoryId = Number(id)
  const navigate = useNavigate()

  const { data: category } = useCategory(categoryId)
  const { data: allCategories } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory(categoryId)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', parentId: undefined },
  })

  useEffect(() => {
    if (category && isEdit) {
      form.reset({
        name: category.name,
        description: category.description ?? '',
        parentId: category.parentId,
      })
    }
  }, [category, isEdit, form])

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      parentId: values.parentId === 0 ? undefined : values.parentId,
    }
    try {
      if (isEdit) {
        await updateCategory.mutateAsync(payload)
        toast.success('Category updated')
        navigate('/categories')
      } else {
        await createCategory.mutateAsync(payload)
        toast.success('Category created')
        navigate('/categories')
      }
    } catch {
      toast.error(isEdit ? 'Failed to update category' : 'Failed to create category')
    }
  }

  const isPending = createCategory.isPending || updateCategory.isPending

  // Exclude self and its descendants from parent options to prevent cycles
  const parentOptions = allCategories?.filter((c) => c.id !== categoryId) ?? []

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Category' : 'Add Category'} />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
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
                    <FormControl><Textarea rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select
                      value={field.value?.toString() ?? 'none'}
                      onValueChange={(v) => field.onChange(v === 'none' ? undefined : Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No parent (top-level)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No parent (top-level)</SelectItem>
                        {parentOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
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
                  {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Category'}
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
