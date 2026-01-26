import Link from 'next/link'
import { Package, Star, ShoppingCart, ArrowUpDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { ProductsPagination } from './products-pagination'
import { ProductsSort } from './products-sort'

interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  sku: string
  selling_price: number
  stock_quantity: number
  category: { name: string; slug: string } | null
}

interface ProductsGridProps {
  category?: string
  search?: string
  sort?: string
  page?: string
  minPrice?: string
  maxPrice?: string
}

const ITEMS_PER_PAGE = 12

async function getProducts(props: ProductsGridProps) {
  const supabase = await createClient()
  const currentPage = parseInt(props.page || '1')
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  let query = (supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      image_url,
      sku,
      selling_price,
      stock_quantity,
      category:categories(name, slug)
    `, { count: 'exact' }) as any)
    .eq('is_active', true)

  // Category filter
  if (props.category) {
    // First get the category id
    const { data: categoryData } = await (supabase
      .from('categories')
      .select('id')
      .eq('slug', props.category)
      .single() as any)

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  // Search filter
  if (props.search) {
    query = query.or(`name.ilike.%${props.search}%,description.ilike.%${props.search}%,sku.ilike.%${props.search}%`)
  }

  // Price filters
  if (props.minPrice) {
    query = query.gte('selling_price', parseInt(props.minPrice))
  }
  if (props.maxPrice) {
    query = query.lte('selling_price', parseInt(props.maxPrice))
  }

  // Sorting
  switch (props.sort) {
    case 'price-asc':
      query = query.order('selling_price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('selling_price', { ascending: false })
      break
    case 'name-asc':
      query = query.order('name', { ascending: true })
      break
    case 'name-desc':
      query = query.order('name', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  // Pagination
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], total: 0 }
  }

  return {
    products: (data || []) as Product[],
    total: count || 0,
  }
}

export async function ProductsGrid(props: ProductsGridProps) {
  const { products, total } = await getProducts(props)
  const currentPage = parseInt(props.page || '1')
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div>
      {/* Header with count and sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Showing <span className="font-medium text-foreground">{products.length}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span> products
          </p>
        </div>
        <ProductsSort currentSort={props.sort} />
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No products found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters or search terms
          </p>
          <Button asChild className="mt-4">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card className="group h-full overflow-hidden border-primary/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Quick view */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="bg-white text-primary px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        View Details
                      </span>
                    </div>

                    {/* Category Badge */}
                    {product.category?.name && (
                      <Badge className="absolute top-2 left-2 bg-white/90 text-foreground hover:bg-white text-xs">
                        {product.category.name}
                      </Badge>
                    )}

                    {/* Stock Badge */}
                    {product.stock_quantity === 0 ? (
                      <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
                        Out of Stock
                      </Badge>
                    ) : product.stock_quantity <= 5 && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-xs bg-amber-100 text-amber-700">
                        Only {product.stock_quantity} left
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-2.5 sm:p-4">
                    {/* SKU - hidden on very small screens */}
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 hidden sm:block">
                      SKU: {product.sku}
                    </p>

                    {/* Name */}
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem]">
                      {product.name}
                    </h3>

                    {/* Rating - smaller on mobile */}
                    <div className="flex items-center gap-0.5 sm:gap-1 mt-1.5 sm:mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[10px] sm:text-xs text-muted-foreground ml-0.5 sm:ml-1">(4.8)</span>
                    </div>

                    {/* Price */}
                    <div className="mt-2 sm:mt-3 flex items-center justify-between">
                      <span className="text-sm sm:text-lg md:text-xl font-bold text-primary">
                        {formatCurrency(product.selling_price)}
                      </span>
                      {product.stock_quantity > 0 && (
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <ProductsPagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
