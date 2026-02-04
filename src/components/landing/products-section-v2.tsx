import Link from 'next/link'
import { ArrowRight, ShoppingCart, Star, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/format'
import { ProductsAnimationWrapper } from './products-animation-wrapper'

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

  const { data, error } = await (supabase
    .from('products') as any)
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

export async function ProductsSectionV2() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="py-24 sm:py-32 bg-[#0a0a15] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[120px]" />
        <div className="absolute left-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-[100px]" />
      </div>

      <div className="container relative z-10 px-4">
        <ProductsAnimationWrapper products={products} />
      </div>
    </section>
  )
}
