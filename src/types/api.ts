// ─── Enums ────────────────────────────────────────────────────────────────────
// Backend serializes enums as integers by default (System.Text.Json)
// JWT role claim is stored as string ("Admin" | "Librarian" | "Member")

export type UserRole = 'Admin' | 'Librarian' | 'Member'

// BookRating: 1–5 integers
export type BookRating = 1 | 2 | 3 | 4 | 5

// BookCollectionStatus — backend values
export type BookCollectionStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Archived'

// BookCollectionItemStatus — backend values
export type BookCollectionItemStatus = 'WantToRead' | 'Reading' | 'Finished' | 'Dropped'

// OrderType sent as string name in query params
export type OrderType = 'Asc' | 'Desc'

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PagedList<T> {
  items: T[]
  totalCount: number
  currentPage: number
  pageSize: number
  totalPages: number
}

export interface PagedRequest {
  page: number
  pageSize: number
  orderBy?: string
  orderType?: OrderType
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
}

export interface UserDto {
  id: number
  fullName: string
  email: string
  role: UserRole
}

export interface LoginResponse {
  accessToken: string
  expiresAt: string
  user: UserDto
}

// ─── Books ────────────────────────────────────────────────────────────────────

export interface BookDto {
  id: number
  title: string
  subtitle?: string
  description?: string
  authorId: number
  categoryId: number
  authorName?: string
  categoryName?: string
}

export interface BookListDto {
  id: number
  title: string
  authorName?: string
  categoryName?: string
  imageUrl?: string
}

export interface BookRequest {
  title: string
  subtitle?: string
  description?: string
  authorId: number
  categoryId: number
}

// ─── Authors ──────────────────────────────────────────────────────────────────

export interface AuthorDto {
  id: number
  fullName: string
  biography?: string
  imageUrl?: string
}

export interface AuthorRequest {
  fullName: string
  biography?: string
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: number
  name: string
  description?: string
  parentId?: number
  parentName?: string
}

export interface CategoryRequest {
  name: string
  description?: string
  parentId?: number
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewDto {
  id: number
  userId: number
  bookId: number
  rating: BookRating
  comment?: string
  userFullName?: string
}

export interface ReviewRequest {
  userId: number
  bookId: number
  rating: BookRating
  comment?: string
}

// ─── Collections ──────────────────────────────────────────────────────────────

export interface BookCollectionItemDto {
  id: number
  bookId: number
  bookTitle?: string
  status: BookCollectionItemStatus
  position: number
}

export interface BookCollectionDto {
  id: number
  userId: number
  name: string
  description?: string
  status: BookCollectionStatus
  items: BookCollectionItemDto[]
}

export interface BookCollectionRequest {
  name: string
  description?: string
  status: BookCollectionStatus
}

export interface BookCollectionItemRequest {
  bookId: number
  status: BookCollectionItemStatus
  position: number
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserCreateRequest {
  fullName: string
  email: string
  password: string
  role: UserRole
}

export interface UserUpdateRequest {
  fullName: string
  email: string
  role: UserRole
}

export interface UpdatePasswordRequest {
  newPassword: string
}

// ─── Display label maps ───────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Admin',
  Librarian: 'Librarian',
  Member: 'Member',
}

export const COLLECTION_STATUS_LABELS: Record<BookCollectionStatus, string> = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  Completed: 'Completed',
  Archived: 'Archived',
}

export const ITEM_STATUS_LABELS: Record<BookCollectionItemStatus, string> = {
  WantToRead: 'Want to Read',
  Reading: 'Reading',
  Finished: 'Finished',
  Dropped: 'Dropped',
}
