'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingCart, Star, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { motion } from 'framer-motion'
import {
  ScrollFade,
  ScaleOnScroll,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  Magnetic
} from '@/components/ui/scroll-animations'

interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  selling_price: number
  stock_quantity: number
  category: { name: string } | null
}

export function ProductsAnimationWrapper({ products }: { products: Product[] }) {
  return (
    <>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
        <div>
          <ScrollFade>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Hot Products
            </span>
          </ScrollFade>
          <ScaleOnScroll scaleStart={0.9}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              <TextReveal text="Featured Products" />
            </h2>
          </ScaleOnScroll>
          <ScrollFade delay={0.2}>
            <p className="mt-3 text-slate-400 text-lg">
              Top-quality IT products at competitive prices
            </p>
          </ScrollFade>
        </div>
        <ScrollFade direction="left">
          <Magnetic strength={0.15}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Magnetic>
        </ScrollFade>
      </div>

      {/* Products Grid */}
      <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" staggerDelay={0.1}>
        {products.map((product) => (
          <StaggerItem key={product.id}>
            <Magnetic strength={0.08}>
              <Link href={`/products/${product.id}`}>
                <Card className="group h-full overflow-hidden bg-white/[0.03] border-white/10 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2">
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-slate-600" />
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Quick view button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        View Details
                      </span>
                    </div>

                    {/* Category Badge */}
                    {product.category?.name && (
                      <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white border-0 text-xs">
                        {product.category.name}
                      </Badge>
                    )}

                    {/* Stock indicator */}
                    {product.stock_quantity <= 5 && (
                      <Badge className="absolute top-3 right-3 bg-red-500/90 text-white border-0 text-xs">
                        Only {product.stock_quantity} left
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2 group-hover:text-blue-400 transition-colors min-h-[2.5rem] sm:min-h-[3rem]">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">(4.8)</span>
                    </div>

                    {/* Price */}
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                        {formatCurrency(product.selling_price)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </Magnetic>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Bottom CTA */}
      <ScrollFade delay={0.5}>
        <div className="mt-12 text-center">
          <Magnetic strength={0.2}>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Explore All Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Magnetic>
        </div>
      </ScrollFade>
    </>
  )
}
