'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Phone,
  ArrowLeft,
  LogIn,
  Loader2,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useInquiry } from '@/lib/contexts/inquiry-context'
import { useUser } from '@/lib/hooks/use-user'
import { formatCurrency } from '@/lib/utils/format'
import { COMPANY_INFO } from '@/lib/utils/constants'
import { submitInquiry } from './actions'
import { toast } from 'sonner'

export default function InquiryPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearInquiry, totalItems } = useInquiry()
  const { user, session, isLoading } = useUser()
  const [isClearing, setIsClearing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerNotes, setCustomerNotes] = useState('')

  const isAuthenticated = !!session || !!user

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-8 px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Inquiry List</span>
          </nav>

          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <LogIn className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Login Required</h2>
              <p className="text-muted-foreground">
                Please login to view and manage your inquiry list.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/register">
                    Create Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate total value
  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Generate WhatsApp message with all items
  const generateWhatsAppMessage = () => {
    let message = "Hi! I'd like to inquire about the following products:\n\n"

    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`
      message += `   SKU: ${item.sku}\n`
      message += `   Qty: ${item.quantity}\n`
      message += `   Price: LKR ${item.price.toLocaleString()} each\n\n`
    })

    message += `---\n`
    message += `Total Items: ${totalItems}\n`
    message += `Estimated Total: LKR ${totalValue.toLocaleString()}\n\n`
    message += `Please provide availability and final pricing. Thank you!`

    return encodeURIComponent(message)
  }

  const handleClearAll = () => {
    setIsClearing(true)
    setTimeout(() => {
      clearInquiry()
      setIsClearing(false)
    }, 300)
  }

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('Your inquiry list is empty')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitInquiry({
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
        })),
        customerNotes: customerNotes || undefined,
      })

      if (result.success) {
        toast.success('Order placed successfully!', {
          description: `Order #${result.orderNumber}`,
        })
        clearInquiry()
        router.push(`/orders/${result.orderId}/confirmation`)
      } else {
        toast.error('Failed to place order', {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'Please try again or contact support',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-8 px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Inquiry List</span>
          </nav>

          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Your inquiry list is empty</h2>
              <p className="text-muted-foreground">
                Browse our products and add items you&apos;re interested in to your inquiry list.
              </p>
              <Button asChild>
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container py-8 px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Inquiry List</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                Inquiry List ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </h1>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleClearAll}
                disabled={isClearing}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 bg-muted shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/products/${item.id}`}
                            className="font-semibold hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        </div>
                        <p className="font-bold text-lg whitespace-nowrap">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Subtotal & Remove */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            Subtotal: <span className="font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</span>
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div className="w-full lg:w-80 shrink-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Inquiry Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate pr-2">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(totalValue)}</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Final pricing will be confirmed after inquiry submission
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                {/* Notes */}
                <div className="w-full space-y-2">
                  <Label htmlFor="notes" className="text-sm">Additional Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requirements or questions..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                </div>

                {/* Place Order - Primary CTA */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Place Order
                    </>
                  )}
                </Button>

                {/* WhatsApp Alternative */}
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366] text-[#128C7E]"
                  asChild
                >
                  <a
                    href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${generateWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Or Chat on WhatsApp
                  </a>
                </Button>

                {/* Continue Shopping */}
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/products">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
