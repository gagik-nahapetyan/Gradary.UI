import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Compass, Heart, Search, Feather, Microscope, Landmark, Library,
  Bookmark, ArrowRight,
} from 'lucide-react'
import { useBooks } from '@/hooks/useBooks'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { booksApi } from '@/api/books'
import { Button } from '@/components/ui/button'
import type { BookListDto, CategoryDto } from '@/types/api'
import type { LucideIcon } from 'lucide-react'

// Deterministic cover color palette
const COVER_COLORS = [
  '#1B2A4A',
  '#1A3A2A',
  '#3A1515',
  '#2E3A0A',
  '#2A1A3A',
  '#0D2B3E',
]

// Map category names to icons
const GENRE_ICONS: Record<string, LucideIcon> = {
  fiction: BookOpen,
  science: Microscope,
  mystery: Search,
  thriller: Search,
  poetry: Feather,
  romance: Heart,
  adventure: Compass,
  history: Landmark,
}

function getGenreIcon(name: string): LucideIcon {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(GENRE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return Library
}

function BookCard({ book, index }: { book: BookListDto; index: number }) {
  const navigate = useNavigate()
  const coverColor = COVER_COLORS[index % COVER_COLORS.length]

  return (
    <div
      className="flex-shrink-0 w-40 cursor-pointer group"
      onClick={() => navigate(`/books/${book.id}`)}
    >
      {/* Cover */}
      <div className="w-full h-56 rounded-lg mb-3 relative overflow-hidden transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
        {book.imageUrl ? (
          <img
            src={booksApi.getImageUrl(book.id)}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-end p-3"
            style={{ backgroundColor: coverColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            {book.categoryName && (
              <span className="relative z-10 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                {book.categoryName}
              </span>
            )}
          </div>
        )}
      </div>
      <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
        {book.title}
      </p>
      {book.authorName && (
        <p className="text-xs text-muted-foreground mt-1 truncate">{book.authorName}</p>
      )}
    </div>
  )
}

function GenreCard({ category }: { category: CategoryDto }) {
  const navigate = useNavigate()
  const Icon = getGenreIcon(category.name)

  return (
    <button
      onClick={() => navigate('/categories')}
      className="flex items-center gap-4 rounded-xl border bg-white p-5 text-left hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{category.name}</p>
        {category.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{category.description}</p>
        )}
      </div>
    </button>
  )
}

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const { data: booksData } = useBooks({ page: 1, pageSize: 6 })
  const { data: categories } = useCategories()

  const featuredBooks = booksData?.items ?? []
  const genreList = categories?.slice(0, 8) ?? []

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-[72vh] items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1C0F08 0%, #3B1F0F 50%, #2A1208 100%)',
        }}
      >
        {/* Amber glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(180,110,30,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <div className="mb-6 flex justify-center">
            <Bookmark className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>

          <h1 className="font-serif text-5xl font-bold leading-tight text-white sm:text-6xl">
            Discover Your Next
            <br />
            <em className="text-primary">Great Read</em>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/70 leading-relaxed">
            Explore thousands of titles across every genre. Your personal library, always open.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 font-semibold">
              <Link to="/books">Browse Collection</Link>
            </Button>
            {isAuthenticated ? (
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 px-8">
                <Link to="/collections">My Collections</Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 px-8">
                <Link to="/register">Join Free</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── Featured Books ──────────────────────────────────────────── */}
      {featuredBooks.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Curated</p>
              <h2 className="font-serif text-3xl font-bold text-foreground">Featured Books</h2>
            </div>
            <Link
              to="/books"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {featuredBooks.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Browse by Genre ─────────────────────────────────────────── */}
      {genreList.length > 0 && (
        <section className="bg-muted/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Explore</p>
              <h2 className="font-serif text-3xl font-bold text-foreground">Browse by Genre</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {genreList.map((cat) => (
                <GenreCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer spacer ───────────────────────────────────────────── */}
      <div className="h-16" />
    </div>
  )
}
