import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthor, useAuthorBooks, useUploadAuthorImage } from '@/hooks/useAuthors'
import { useAuth } from '@/hooks/useAuth'
import { authorsApi } from '@/api/authors'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PAGE_SIZE = 10

export function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const authorId = Number(id)
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [page, setPage] = useState(1)
  const [imageVersion, setImageVersion] = useState(0)
  const [photoError, setPhotoError] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)

  const { data: author, isLoading } = useAuthor(authorId)
  const { data: books } = useAuthorBooks(authorId, { page, pageSize: PAGE_SIZE })
  const uploadImage = useUploadAuthorImage(authorId)

  const canEdit = hasRole('Admin', 'Librarian')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await uploadImage.mutateAsync(file)
      setPhotoError(false)
      setImageVersion((v) => v + 1)
      toast.success('Photo updated')
    } catch {
      toast.error('Failed to upload photo')
    } finally {
      e.target.value = ''
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!author) return <p className="text-muted-foreground">Author not found.</p>

  const photoSrc = `${authorsApi.getImageUrl(authorId)}?v=${imageVersion}`
  const initials = author.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6">
      {/* Header row: photo + name + actions */}
      <div className="flex items-start gap-5">
        {/* Photo */}
        <div className="relative group shrink-0">
          {photoError ? (
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">{initials}</span>
            </div>
          ) : (
            <img
              src={photoSrc}
              alt={author.fullName}
              className="h-24 w-24 rounded-full object-cover shadow-md"
              onError={() => setPhotoError(true)}
            />
          )}
          {canEdit && (
            <button
              onClick={() => imageInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          )}
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Name + actions */}
        <div className="flex-1 flex items-start justify-between pt-1">
          <div>
            <h1 className="font-serif text-2xl font-bold">{author.fullName}</h1>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}
                  disabled={uploadImage.isPending}>
                  <Camera className="mr-2 h-4 w-4" />
                  {uploadImage.isPending ? 'Uploading…' : 'Upload Photo'}
                </Button>
              )}
              <Button size="sm" onClick={() => navigate(`/authors/${authorId}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      {author.biography && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed">{author.biography}</p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="font-serif text-lg font-semibold mb-4">Books by {author.fullName}</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books?.items?.map((book) => (
                <TableRow
                  key={book.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <TableCell>
                    {book.imageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${book.imageUrl}`}
                        alt={book.title}
                        className="h-12 w-9 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-9 rounded bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell className="text-muted-foreground">{book.categoryName ?? '—'}</TableCell>
                </TableRow>
              ))}
              {(books?.items?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No books found for this author.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {books && books.totalPages > 1 && (
          <Pagination
            currentPage={books.currentPage}
            totalPages={books.totalPages}
            totalCount={books.totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
