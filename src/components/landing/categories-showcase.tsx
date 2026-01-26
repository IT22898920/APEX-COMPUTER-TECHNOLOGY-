import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Laptop, Monitor, Printer, HardDrive, Cpu, Network, Cable, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  product_count: number
}

// Icon mapping for categories
const categoryIcons: Record<string, typeof Laptop> = {
  laptops: Laptop,
  desktops: Monitor,
  printers: Printer,
  storage: HardDrive,
  components: Cpu,
  networking: Network,
  cables: Cable,
  monitors: Monitor,
}

// Gradient backgrounds for visual variety
const gradients = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-emerald-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-teal-500 to-cyan-500',
]

interface CategoryData {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

async function getTopCategories(): Promise<Category[]> {
  const supabase = await createClient()

  try {
    // Get categories - removed is_active filter, using simpler query
    const { data: categories, error } = await (supabase
      .from('categories')
      .select('id, name, slug, description')
      .order('display_order', { ascending: true })
      .limit(12) as any)

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    if (!categories || categories.length === 0) {
      return []
    }

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      (categories as CategoryData[]).map(async (cat) => {
        const { count } = await (supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id) as any)

        return {
          ...cat,
          image_url: null,
          product_count: count || 0
        }
      })
    )

    // Sort by product count and return top categories with products
    return categoriesWithCounts
      .filter((c: Category) => c.product_count > 0)
      .sort((a: Category, b: Category) => b.product_count - a.product_count)
      .slice(0, 8)
  } catch (err) {
    console.error('Unexpected error in getTopCategories:', err)
    return []
  }
}

export async function CategoriesShowcase() {
  const categories = await getTopCategories()

  if (categories.length === 0) return null

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 px-4 sm:px-0">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            Browse by Category
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need from our wide range of IT products and accessories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 px-4 sm:px-0">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.slug.toLowerCase()] || Package
            const gradient = gradients[index % gradients.length]

            return (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <div className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden cursor-pointer">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '20px 20px'
                    }} />
                  </div>

                  {/* Icon */}
                  <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                    <Icon className="h-20 w-20 sm:h-24 sm:w-24 text-white" strokeWidth={1} />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                    <h3 className="font-bold text-lg sm:text-xl mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {category.name}
                    </h3>
                    <p className="text-sm text-white/80 flex items-center">
                      {category.product_count} Products
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* View All Categories */}
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center text-primary font-medium hover:underline"
          >
            View All Categories
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
