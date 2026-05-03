import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/shared/AppLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { RoleRoute } from '@/components/shared/RoleRoute'

// Home
import { HomePage } from '@/pages/home/HomePage'

// Auth
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

// Books
import { BooksPage } from '@/pages/books/BooksPage'
import { BookDetailPage } from '@/pages/books/BookDetailPage'
import { BookFormPage } from '@/pages/books/BookFormPage'

// Authors
import { AuthorsPage } from '@/pages/authors/AuthorsPage'
import { AuthorDetailPage } from '@/pages/authors/AuthorDetailPage'
import { AuthorFormPage } from '@/pages/authors/AuthorFormPage'

// Categories
import { CategoriesPage } from '@/pages/categories/CategoriesPage'
import { CategoryFormPage } from '@/pages/categories/CategoryFormPage'

// Collections
import { CollectionsPage } from '@/pages/collections/CollectionsPage'
import { CollectionDetailPage } from '@/pages/collections/CollectionDetailPage'

// Users
import { UsersPage } from '@/pages/users/UsersPage'
import { UserFormPage } from '@/pages/users/UserFormPage'
import { ProfilePage } from '@/pages/users/ProfilePage'

// Wrapper that adds consistent inner-page padding
function InnerPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Homepage — full width, no inner padding wrapper
      { index: true, element: <HomePage /> },

      // Public routes
      { path: 'books', element: <InnerPage><BooksPage /></InnerPage> },
      { path: 'books/:id', element: <InnerPage><BookDetailPage /></InnerPage> },
      { path: 'authors', element: <InnerPage><AuthorsPage /></InnerPage> },
      { path: 'authors/:id', element: <InnerPage><AuthorDetailPage /></InnerPage> },
      { path: 'categories', element: <InnerPage><CategoriesPage /></InnerPage> },

      // Admin / Librarian only
      {
        element: <RoleRoute roles={['Admin', 'Librarian']} />,
        children: [
          { path: 'books/new', element: <InnerPage><BookFormPage /></InnerPage> },
          { path: 'books/:id/edit', element: <InnerPage><BookFormPage /></InnerPage> },
          { path: 'authors/new', element: <InnerPage><AuthorFormPage /></InnerPage> },
          { path: 'authors/:id/edit', element: <InnerPage><AuthorFormPage /></InnerPage> },
          { path: 'categories/new', element: <InnerPage><CategoryFormPage /></InnerPage> },
          { path: 'categories/:id/edit', element: <InnerPage><CategoryFormPage /></InnerPage> },
          { path: 'users', element: <InnerPage><UsersPage /></InnerPage> },
        ],
      },

      // Admin only
      {
        element: <RoleRoute roles={['Admin']} />,
        children: [
          { path: 'users/new', element: <InnerPage><UserFormPage /></InnerPage> },
          { path: 'users/:id/edit', element: <InnerPage><UserFormPage /></InnerPage> },
        ],
      },

      // Authenticated
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'collections', element: <InnerPage><CollectionsPage /></InnerPage> },
          { path: 'collections/:id', element: <InnerPage><CollectionDetailPage /></InnerPage> },
          { path: 'profile', element: <InnerPage><ProfilePage /></InnerPage> },
        ],
      },
    ],
  },

  // Standalone auth pages (no layout)
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
])
