import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateUser, useUpdatePassword } from '@/hooks/useUsers'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
})
type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
})
type PasswordValues = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const { user, login } = useAuth()
  const [profileEditing, setProfileEditing] = useState(false)

  const updateUser = useUpdateUser(user!.id)
  const updatePassword = useUpdatePassword(user!.id)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? '', email: user?.email ?? '' },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onProfileSubmit = async (values: ProfileValues) => {
    try {
      const updated = await updateUser.mutateAsync({ ...values, role: user!.role })
      // Refresh user in auth context
      login({
        accessToken: localStorage.getItem('ol_token')!,
        expiresAt: '',
        user: updated,
      })
      toast.success('Profile updated')
      setProfileEditing(false)
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const onPasswordSubmit = async (values: PasswordValues) => {
    try {
      await updatePassword.mutateAsync({ newPassword: values.newPassword })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch {
      toast.error('Failed to change password')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="My Profile" />

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Account Information
            <Badge variant="secondary">{user?.role}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileEditing ? (
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
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
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <Button type="submit" size="sm" disabled={updateUser.isPending}>
                    {updateUser.isPending ? 'Saving…' : 'Save'}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setProfileEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Full Name</span>
                  <p className="font-medium">{user?.fullName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setProfileEditing(true)}>
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="sm" disabled={updatePassword.isPending}>
                {updatePassword.isPending ? 'Changing…' : 'Change Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
