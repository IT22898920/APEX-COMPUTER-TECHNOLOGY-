'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Check, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInquiry } from '@/lib/contexts/inquiry-context'
import { useUser } from '@/lib/hooks/use-user'
import { toast } from 'sonner'

interface AddToInquiryButtonProps {
  product: {
    id: string
    name: string
    sku: string
    selling_price: number
    image_url: string | null
    stock_quantity: number
  }
}

export function AddToInquiryButton({ product }: AddToInquiryButtonProps) {
  const router = useRouter()
  const { addItem, isInInquiry } = useInquiry()
  const { user, session } = useUser()
  const [justAdded, setJustAdded] = useState(false)

  const isAuthenticated = !!session || !!user
  const inStock = product.stock_quantity > 0
  const alreadyInList = isInInquiry(product.id)

  const handleAddToInquiry = () => {
    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error('Please login first', {
        description: 'You need to login to add items to your inquiry list',
        action: {
          label: 'Login',
          onClick: () => router.push('/login'),
        },
      })
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.selling_price,
      image: product.image_url,
    })

    setJustAdded(true)
    toast.success('Added to inquiry list', {
      description: product.name,
    })

    // Reset the "just added" state after 2 seconds
    setTimeout(() => setJustAdded(false), 2000)
  }

  if (!inStock) {
    return (
      <Button size="lg" className="flex-1 h-12 sm:h-14" disabled>
        <ShoppingCart className="mr-2 h-5 w-5" />
        Out of Stock
      </Button>
    )
  }

  if (justAdded || alreadyInList) {
    return (
      <Button
        size="lg"
        className="flex-1 h-12 sm:h-14 bg-green-600 hover:bg-green-700"
        onClick={handleAddToInquiry}
      >
        <Check className="mr-2 h-5 w-5" />
        {justAdded ? 'Added!' : 'Add More'}
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="flex-1 h-12 sm:h-14"
      onClick={handleAddToInquiry}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      Add to Inquiry
    </Button>
  )
}
