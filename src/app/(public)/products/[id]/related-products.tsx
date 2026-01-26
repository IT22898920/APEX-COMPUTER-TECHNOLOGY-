import Link from 'next/link'
import { Package, Star, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'

interface Product {
  id: string
  name: string
  image_url: string | null
  selling_price: number
  stock_quantity: number
  category: { name: string } | null
}

interface RelatedProductsProps {
  currentProductId: string
  categoryId: string | null
}

async function getRelatedProducts(
  currentProductId: string,
  categoryId: string | null
): Promise<Product[]> {
  const supabase = await createClient()

  let query = (supabase
    .from('products')
    .select(`
      id,
      name,
      image_url,
      selling_price,
      stock_quantity,
      category:categories(name)
    `) as any)
    .eq('is_active', true)
    .neq('id', currentProductId)
    .limit(4)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching related products:', error)
    return []
  }

  return (data || []) as Product[]
}

export async function RelatedProducts({
  currentProductId,
  categoryId,
}: RelatedProductsProps) {
  const products = await getRelatedProducts(currentProductId, categoryId)

  if (products.length === 0) {
    return null
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Related Products</h2>
        <Button variant="ghost" asChild>
          <Link href="/products">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <Card className="group h-full overflow-hidden border-primary/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}

                {/* Stock Badge */}
                {product.stock_quantity === 0 && (
                  <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Price */}
                <div className="mt-2">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(product.selling_price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
