import Link from 'next/link'
import { ArrowRight, ShoppingCart, Star, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/format'

interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  selling_price: number
  stock_quantity: number
  category: { name: string } | null
}

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      image_url,
      selling_price,
      stock_quantity,
      category:categories(name)
    `)
    .eq('is_active', true)
    .gt('stock_quantity', 0)
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data as Product[]
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[100px]" />
        <div className="absolute left-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-[80px]" />
      </div>

      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12 px-4 sm:px-0">
          <div>
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-3">
              <Sparkles className="mr-2 h-4 w-4" />
              Hot Products
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Featured Products
            </h2>
            <p className="mt-2 text-muted-foreground">
              Top-quality IT products at competitive prices
            </p>
          </div>
          <Button variant="outline" className="w-fit" asChild>
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 px-4 sm:px-0">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="group h-full overflow-hidden border-primary/10 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Quick view button */}
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

                  {/* Stock indicator */}
                  {product.stock_quantity <= 5 && (
                    <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
                      Only {product.stock_quantity} left
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
                    {product.name}
                  </h3>

                  {/* Rating placeholder */}
                  <div className="flex items-center gap-1 mt-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
                  </div>

                  {/* Price */}
                  <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      {formatCurrency(product.selling_price)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 sm:mt-14 text-center">
          <Button size="lg" className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 px-8" asChild>
            <Link href="/products">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Explore All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
