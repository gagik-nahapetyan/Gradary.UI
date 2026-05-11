import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useUser, useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { UserRole } from '@/types/api'

const createSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Librarian', 'Member']),
})

const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['Admin', 'Librarian', 'Member']),
})

type CreateValues = z.infer<typeof createSchema>

const ROLES: UserRole[] = ['Admin', 'Librarian', 'Member']

export function UserFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const userId = Number(id)
  const navigate = useNavigate()

  const { data: user } = useUser(userId)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser(userId)

  const form = useForm<CreateValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: { fullName: '', email: '', password: '', role: 'Member' },
  })

  useEffect(() => {
    if (user && isEdit) {
      form.reset({ fullName: user.fullName, email: user.email, role: user.role, password: '' })
    }
  }, [user, isEdit, form])

  const onSubmit = async (values: CreateValues) => {
    try {
      if (isEdit) {
        await updateUser.mutateAsync({ fullName: values.fullName, email: values.email, role: values.role })
        toast.success('User updated')
        navigate('/users')
      } else {
        await createUser.mutateAsync(values)
        toast.success('User created')
        navigate('/users')
      }
    } catch {
      toast.error(isEdit ? 'Failed to update user' : 'Failed to create user')
    }
  }

  const isPending = createUser.isPending || updateUser.isPending

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit User' : 'Add User'} />
      <Card className="max-w-lg">
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
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
