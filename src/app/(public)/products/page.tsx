import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductsGrid } from './products-grid'
import { ProductsFilter } from './products-filter'
import { ProductsHeader } from './products-header'

export const dynamic = 'force-dynamic'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('categories')
    .select('id, name, slug, description, parent_id')
    .order('display_order', { ascending: true }) as any)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

interface SearchParams {
  category?: string
  search?: string
  sort?: string
  page?: string
  min?: string
  max?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Header Section */}
      <ProductsHeader />

      <div className="container py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <ProductsFilter
              categories={categories}
              currentCategory={params.category}
              minPrice={params.min}
              maxPrice={params.max}
            />
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <Suspense fallback={<ProductsGridSkeleton />}>
              <ProductsGrid
                category={params.category}
                search={params.search}
                sort={params.sort}
                page={params.page}
                minPrice={params.min}
                maxPrice={params.max}
              />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="rounded-xl border bg-card animate-pulse">
          <div className="aspect-square bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-6 bg-muted rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
