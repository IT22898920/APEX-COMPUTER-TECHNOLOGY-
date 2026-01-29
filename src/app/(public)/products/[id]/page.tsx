import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronRight,
  Star,
  Package,
  Shield,
  Truck,
  RotateCcw,
  Phone,
  CheckCircle2,
  MessageCircle,
  Info,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import { COMPANY_INFO } from '@/lib/utils/constants'
import { ProductImageGallery } from './product-image-gallery'
import { RelatedProducts } from './related-products'
import { AddToInquiryButton } from './add-to-inquiry-button'

interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  images: string[] | null
  sku: string
  selling_price: number
  cost_price: number
  stock_quantity: number
  category_id: string | null
  category: { id: string; name: string; slug: string } | null
  specifications: Record<string, string> | null
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      image_url,
      images,
      sku,
      selling_price,
      cost_price,
      stock_quantity,
      category_id,
      specifications,
      category:categories(id, name, slug)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single() as any)

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as Product
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  // Combine image_url with images array for gallery
  const allImages: string[] = []
  if (product.image_url) allImages.push(product.image_url)
  if (product.images) {
    product.images.forEach((img) => {
      if (img && !allImages.includes(img)) {
        allImages.push(img)
      }
    })
  }

  const inStock = product.stock_quantity > 0
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 5

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 overflow-x-auto pb-2">
          <Link href="/" className="hover:text-foreground transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
          <Link href="/products" className="hover:text-foreground transition-colors shrink-0">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 hidden sm:block" />
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-foreground transition-colors shrink-0 hidden sm:block"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[120px] sm:max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={allImages} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & SKU */}
            <div className="flex flex-wrap items-center gap-3">
              {product.category && (
                <Badge variant="secondary">{product.category.name}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                SKU: {product.sku}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                4.8 (24 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-primary">
                  {formatCurrency(product.selling_price)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Price includes VAT
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className={`font-medium ${lowStock ? 'text-amber-600' : 'text-green-600'}`}>
                    {lowStock
                      ? `Only ${product.stock_quantity} left in stock`
                      : 'In Stock'}
                  </span>
                </>
              ) : (
                <>
                  <Package className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Specifications
                </h3>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], index) => (
                        <tr
                          key={key}
                          className={index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}
                        >
                          <td className="px-4 py-3 font-medium text-sm w-1/3 border-r">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Separator />

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              {/* WhatsApp Button - Primary CTA */}
              <Button
                size="lg"
                className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white"
                asChild
              >
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${encodeURIComponent(
                    `Hi! I'm interested in:\n\n*${product.name}*\nSKU: ${product.sku}\nPrice: LKR ${product.selling_price.toLocaleString()}\n\nPlease provide more details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Order via WhatsApp
                </a>
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                <AddToInquiryButton
                  product={{
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    selling_price: product.selling_price,
                    image_url: product.image_url,
                    stock_quantity: product.stock_quantity,
                  }}
                />
                <Button size="lg" variant="outline" className="flex-1 h-12 sm:h-14" asChild>
                  <a href={`tel:${COMPANY_INFO.phone}`}>
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now
                  </a>
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">Genuine Warranty</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Manufacturer backed</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">Fast Delivery</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Island-wide shipping</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                <RotateCcw className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">Easy Returns</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">7-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">Expert Support</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Technical help</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <RelatedProducts
            currentProductId={product.id}
            categoryId={product.category_id}
          />
        </div>
      </div>
    </div>
  )
}
