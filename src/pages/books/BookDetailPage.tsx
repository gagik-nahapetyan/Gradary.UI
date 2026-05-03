import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Pencil, Upload, Trash2, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { useBook, useUploadBookFile, useUploadBookImage } from '@/hooks/useBooks'
import { useBookReviews, useCreateReview, useDeleteReview } from '@/hooks/useReviews'
import { useAuth } from '@/hooks/useAuth'
import { booksApi } from '@/api/books'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { BookRating, OrderType } from '@/types/api'

const PAGE_SIZE = 5

const COVER_COLORS = ['#1B2A4A', '#1A3A2A', '#3A1515', '#2E3A0A', '#2A1A3A', '#0D2B3E']

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const bookId = Number(id)
  const navigate = useNavigate()
  const { user, isAuthenticated, hasRole } = useAuth()

  const [reviewPage, setReviewPage] = useState(1)
  const [reviewOrderBy] = useState('created')
  const [reviewOrderType] = useState<OrderType>('Desc')
  const [rating, setRating] = useState<BookRating>(5)
  const [comment, setComment] = useState('')
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null)
  const [imageVersion, setImageVersion] = useState(0)
  const [coverError, setCoverError] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const { data: book, isLoading: bookLoading } = useBook(bookId)
  const { data: reviews, isLoading: reviewsLoading } = useBookReviews(bookId, {
    page: reviewPage,
    pageSize: PAGE_SIZE,
    orderBy: reviewOrderBy,
    orderType: reviewOrderType,
  })

  const uploadFile = useUploadBookFile(bookId)
  const uploadImage = useUploadBookImage(bookId)
  const createReview = useCreateReview(bookId)
  const deleteReview = useDeleteReview(bookId)

  const canEdit = hasRole('Admin', 'Librarian')
  const coverColor = COVER_COLORS[bookId % COVER_COLORS.length]

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await uploadFile.mutateAsync(file)
      toast.success('File uploaded')
    } catch {
      toast.error('Failed to upload file')
    } finally {
      e.target.value = ''
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await uploadImage.mutateAsync(file)
      setCoverError(false)
      setImageVersion((v) => v + 1)
      toast.success('Cover image updated')
    } catch {
      toast.error('Failed to upload cover image')
    } finally {
      e.target.value = ''
    }
  }

  const handleSubmitReview = async () => {
    if (!user) return
    try {
      await createReview.mutateAsync({ userId: user.id, bookId, rating, comment })
      toast.success('Review submitted')
      setComment('')
      setRating(5)
    } catch {
      toast.error('Failed to submit review')
    }
  }

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return
    try {
      await deleteReview.mutateAsync(deleteReviewId)
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeleteReviewId(null)
    }
  }

  if (bookLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-6">
          <Skeleton className="h-64 w-44 rounded-lg shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!book) return <p className="text-muted-foreground">Book not found.</p>

  const coverSrc = `${booksApi.getImageUrl(bookId)}?v=${imageVersion}`

  return (
    <div className="space-y-6">
      <PageHeader
        title={book.title}
        description={book.subtitle}
        action={
          canEdit ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}
                disabled={uploadImage.isPending}>
                <ImagePlus className="mr-2 h-4 w-4" />
                {uploadImage.isPending ? 'Uploading…' : 'Upload Cover'}
              </Button>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}
                disabled={uploadFile.isPending}>
                <Upload className="mr-2 h-4 w-4" />
                {uploadFile.isPending ? 'Uploading…' : 'Upload File'}
              </Button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />

              <Button size="sm" onClick={() => navigate(`/books/${bookId}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Book details — cover + metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-6">
            {/* Cover */}
            <div className="shrink-0 relative group">
              {coverError ? (
                <div
                  className="w-40 h-60 rounded-lg flex items-end p-3"
                  style={{ backgroundColor: coverColor }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg" />
                </div>
              ) : (
                <img
                  src={coverSrc}
                  alt={`Cover of ${book.title}`}
                  className="w-40 h-60 object-cover rounded-lg shadow-md"
                  onError={() => setCoverError(true)}
                />
              )}
              {canEdit && (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ImagePlus className="h-6 w-6 text-white" />
                </button>
              )}
            </div>

            {/* Metadata */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Author</span>
                  <p className="font-medium">
                    <Link to={`/authors/${book.authorId}`} className="hover:underline text-primary">
                      {book.authorName ?? `Author #${book.authorId}`}
                    </Link>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium">{book.categoryName ?? `Category #${book.categoryId}`}</p>
                </div>
              </div>
              {book.description && (
                <>
                  <Separator />
                  <p className="text-sm leading-relaxed">{book.description}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <div>
        <h2 className="font-serif text-lg font-semibold mb-4">Reviews</h2>

        {isAuthenticated && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Write a Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Rating</Label>
                <Select value={rating.toString()} onValueChange={(v) => setRating(Number(v) as BookRating)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <SelectItem key={r} value={r.toString()}>
                        {'★'.repeat(r)} {r}/5
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Comment (optional)</Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts…"
                  rows={3}
                />
              </div>
              <Button size="sm" onClick={handleSubmitReview} disabled={createReview.isPending}>
                {createReview.isPending ? 'Submitting…' : 'Submit Review'}
              </Button>
            </CardContent>
          </Card>
        )}

        {reviewsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (reviews?.items?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews?.items?.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                        <span className="text-sm font-medium">
                          {review.userFullName ?? `User #${review.userId}`}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                    {(user?.id === review.userId || hasRole('Admin')) && (
                      <Button
                        size="icon" variant="ghost"
                        className="text-destructive h-8 w-8"
                        onClick={() => setDeleteReviewId(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {reviews && reviews.totalPages > 1 && (
          <Pagination
            currentPage={reviews.currentPage}
            totalPages={reviews.totalPages}
            totalCount={reviews.totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setReviewPage}
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteReviewId !== null}
        onOpenChange={(open) => !open && setDeleteReviewId(null)}
        title="Delete review"
        description="This will permanently delete the review."
        onConfirm={handleDeleteReview}
        loading={deleteReview.isPending}
      />
    </div>
  )
}
