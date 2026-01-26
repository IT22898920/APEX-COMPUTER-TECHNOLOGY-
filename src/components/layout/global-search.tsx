'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package,
  FolderTree,
  Briefcase,
  Users,
  Search,
  FileText,
  Settings,
  LayoutDashboard
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  href: string
  type: 'product' | 'category' | 'service' | 'user' | 'page'
}

// Quick navigation pages
const quickPages: SearchResult[] = [
  { id: 'dashboard', title: 'Dashboard', href: '/admin', type: 'page' },
  { id: 'products', title: 'Products', subtitle: 'Manage products', href: '/admin/products', type: 'page' },
  { id: 'products-new', title: 'Add New Product', href: '/admin/products/new', type: 'page' },
  { id: 'categories', title: 'Categories', subtitle: 'Manage categories', href: '/admin/categories', type: 'page' },
  { id: 'categories-new', title: 'Add New Category', href: '/admin/categories/new', type: 'page' },
  { id: 'services', title: 'Services', subtitle: 'Manage services', href: '/admin/services', type: 'page' },
  { id: 'services-new', title: 'Add New Service', href: '/admin/services/new', type: 'page' },
  { id: 'users', title: 'Users', subtitle: 'Manage users', href: '/admin/users', type: 'page' },
  { id: 'users-new', title: 'Add New User', href: '/admin/users/new', type: 'page' },
  { id: 'settings', title: 'Settings', href: '/admin/settings', type: 'page' },
]

const getIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'product':
      return Package
    case 'category':
      return FolderTree
    case 'service':
      return Briefcase
    case 'user':
      return Users
    case 'page':
      return LayoutDashboard
    default:
      return FileText
  }
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Open with Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Common words to skip in search
  const stopWords = new Set(['a', 'an', 'the', 'of', 'all', 'and', 'or', 'for', 'to', 'in', 'on', 'at', 'by', 'is', 'are', 'was', 'were', 'also', 'non', 'branded'])

  // Get meaningful search words from query
  const getSearchWords = (query: string): string[] => {
    const cleaned = query
      .replace(/[^a-zA-Z0-9\s\-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()

    // Filter out stop words and short words
    const words = cleaned.split(' ').filter(w => w.length > 2 && !stopWords.has(w))
    return words.slice(0, 3) // Max 3 words
  }

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    const supabase = createClient()
    const searchResults: SearchResult[] = []
    const searchWords = getSearchWords(searchQuery)


    // Don't search if no meaningful words
    if (searchWords.length === 0) {
      setResults([])
      setLoading(false)
      return
    }

    // Use first meaningful word for search
    const primaryWord = searchWords[0]

    try {
      // Search products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, sku, description')
        .or(`name.ilike.%${primaryWord}%,sku.ilike.%${primaryWord}%,description.ilike.%${primaryWord}%`)
        .limit(5)

      if (productsError) console.error('Products search error:', productsError)

      if (products) {
        (products as { id: string; name: string; sku: string; description: string | null }[]).forEach(p => {
          searchResults.push({
            id: p.id,
            title: p.name,
            subtitle: p.sku ? `SKU: ${p.sku}` : (p.description ? p.description.substring(0, 50) + '...' : ''),
            href: `/admin/products/${p.id}`,
            type: 'product'
          })
        })
      }

      // Search categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .or(`name.ilike.%${primaryWord}%,slug.ilike.%${primaryWord}%,description.ilike.%${primaryWord}%`)
        .limit(5)

      if (categoriesError) console.error('Categories search error:', categoriesError)

      if (categories) {
        (categories as { id: string; name: string; slug: string; description: string | null }[]).forEach(c => {
          searchResults.push({
            id: c.id,
            title: c.name,
            subtitle: c.description ? c.description.substring(0, 50) + (c.description.length > 50 ? '...' : '') : c.slug,
            href: `/admin/categories/${c.id}`,
            type: 'category'
          })
        })
      }

      // Search services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, title, slug, description')
        .or(`title.ilike.%${primaryWord}%,slug.ilike.%${primaryWord}%,description.ilike.%${primaryWord}%`)
        .limit(5)

      if (servicesError) console.error('Services search error:', servicesError)

      if (services) {
        (services as { id: string; title: string; slug: string; description: string | null }[]).forEach(s => {
          searchResults.push({
            id: s.id,
            title: s.title,
            subtitle: s.description ? s.description.substring(0, 60) + (s.description.length > 60 ? '...' : '') : s.slug,
            href: `/admin/services/${s.id}`,
            type: 'service'
          })
        })
      }

      // Search users (profiles)
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role')
        .or(`full_name.ilike.%${primaryWord}%,phone.ilike.%${primaryWord}%`)
        .limit(5)

      if (usersError) console.error('Users search error:', usersError)

      if (users) {
        (users as { id: string; full_name: string; phone: string | null; role: string }[]).forEach(u => {
          searchResults.push({
            id: u.id,
            title: u.full_name,
            subtitle: u.role.charAt(0).toUpperCase() + u.role.slice(1),
            href: `/admin/users/${u.id}`,
            type: 'user'
          })
        })
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, search])

  const handleSelect = (href: string) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }

  // Filter quick pages based on query
  const filteredPages = query
    ? quickPages.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
    : quickPages.slice(0, 6)

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm text-muted-foreground sm:pr-12 md:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Search products, categories, services, customers..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? 'Searching...' : 'No results found.'}
          </CommandEmpty>

          {/* Search Results */}
          {results.length > 0 && (
            <>
              {/* Products */}
              {results.filter(r => r.type === 'product').length > 0 && (
                <CommandGroup heading="Products">
                  {results.filter(r => r.type === 'product').map((result) => {
                    const Icon = getIcon(result.type)
                    return (
                      <CommandItem
                        key={result.id}
                        value={result.title}
                        onSelect={() => handleSelect(result.href)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {/* Categories */}
              {results.filter(r => r.type === 'category').length > 0 && (
                <CommandGroup heading="Categories">
                  {results.filter(r => r.type === 'category').map((result) => {
                    const Icon = getIcon(result.type)
                    return (
                      <CommandItem
                        key={result.id}
                        value={result.title}
                        onSelect={() => handleSelect(result.href)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {/* Services */}
              {results.filter(r => r.type === 'service').length > 0 && (
                <CommandGroup heading="Services">
                  {results.filter(r => r.type === 'service').map((result) => {
                    const Icon = getIcon(result.type)
                    return (
                      <CommandItem
                        key={result.id}
                        value={result.title}
                        onSelect={() => handleSelect(result.href)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              {/* Users */}
              {results.filter(r => r.type === 'user').length > 0 && (
                <CommandGroup heading="Users">
                  {results.filter(r => r.type === 'user').map((result) => {
                    const Icon = getIcon(result.type)
                    return (
                      <CommandItem
                        key={result.id}
                        value={result.title}
                        onSelect={() => handleSelect(result.href)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          <span>{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              <CommandSeparator />
            </>
          )}

          {/* Quick Navigation */}
          <CommandGroup heading="Quick Navigation">
            {filteredPages.map((page) => (
              <CommandItem
                key={page.id}
                value={page.title}
                onSelect={() => handleSelect(page.href)}
              >
                {page.id === 'settings' ? (
                  <Settings className="mr-2 h-4 w-4" />
                ) : page.id === 'dashboard' ? (
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                ) : page.id.includes('product') ? (
                  <Package className="mr-2 h-4 w-4" />
                ) : page.id.includes('categor') ? (
                  <FolderTree className="mr-2 h-4 w-4" />
                ) : page.id.includes('service') ? (
                  <Briefcase className="mr-2 h-4 w-4" />
                ) : page.id.includes('user') ? (
                  <Users className="mr-2 h-4 w-4" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                <div className="flex flex-col">
                  <span>{page.title}</span>
                  {page.subtitle && (
                    <span className="text-xs text-muted-foreground">{page.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
