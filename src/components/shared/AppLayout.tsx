import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, Users, BookMarked, List, User, Menu, LogOut, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/books', label: 'Browse', public: true },
  { to: '/authors', label: 'Authors', public: true },
  { to: '/categories', label: 'Genres', public: true },
  { to: '/collections', label: 'Collections', public: false },
  { to: '/users', label: 'Users', roles: ['Admin', 'Librarian'] },
]

function NavLinks({ onClick }: { onClick?: () => void }) {
  const { isAuthenticated, hasRole } = useAuth()

  return (
    <>
      {navItems
        .filter((item) => {
          if (item.roles) return isAuthenticated && hasRole(...(item.roles as any))
          if (!item.public) return isAuthenticated
          return true
        })
        .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClick}
            className={({ isActive }) =>
              cn(
                'text-sm font-medium transition-colors hover:text-primary',
                isActive
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-foreground/70'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
    </>
  )
}

export function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky top nav */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-6">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-serif text-xl font-bold text-foreground tracking-wide">Gradary</span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLinks />
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/5">
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </Link>
                </Button>
              )}

              {/* Mobile hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-6">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-left">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="font-serif text-lg font-bold">Gradary</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4">
                    <NavLinks onClick={() => setMobileOpen(false)} />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
