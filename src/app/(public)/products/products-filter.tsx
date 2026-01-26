'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
}

interface ProductsFilterProps {
  categories: Category[]
  currentCategory?: string
  minPrice?: string
  maxPrice?: string
}

export function ProductsFilter({
  categories,
  currentCategory,
  minPrice,
  maxPrice,
}: ProductsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceMin, setPriceMin] = useState(minPrice || '')
  const [priceMax, setPriceMax] = useState(maxPrice || '')
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)

  // Get parent categories (those without parent_id)
  const parentCategories = categories.filter(c => !c.parent_id)
  const getChildCategories = (parentId: string) =>
    categories.filter(c => c.parent_id === parentId)

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to first page
    router.push(`/products?${params.toString()}`)
  }

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (priceMin) params.set('min', priceMin)
    else params.delete('min')
    if (priceMax) params.set('max', priceMax)
    else params.delete('max')
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/products')
    setPriceMin('')
    setPriceMax('')
  }

  const hasActiveFilters = currentCategory || minPrice || maxPrice || searchParams.get('search')

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Filters</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchParams.get('search') && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchParams.get('search')}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('search', null)}
                />
              </Badge>
            )}
            {currentCategory && (
              <Badge variant="secondary" className="gap-1">
                {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('category', null)}
                />
              </Badge>
            )}
            {(minPrice || maxPrice) && (
              <Badge variant="secondary" className="gap-1">
                Price: {minPrice || '0'} - {maxPrice || '∞'}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setPriceMin('')
                    setPriceMax('')
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete('min')
                    params.delete('max')
                    router.push(`/products?${params.toString()}`)
                  }}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-semibold">
            Categories
            <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="space-y-1">
            <button
              onClick={() => updateFilter('category', null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !currentCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              All Products
            </button>
            {parentCategories.map((category) => {
              const children = getChildCategories(category.id)
              const isActive = currentCategory === category.slug

              return (
                <div key={category.id}>
                  <button
                    onClick={() => updateFilter('category', category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {category.name}
                  </button>
                  {children.length > 0 && (
                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-muted pl-3">
                      {children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => updateFilter('category', child.slug)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            currentCategory === child.slug
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-semibold">
            Price Range
            <ChevronDown className={`h-4 w-4 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                  Min (LKR)
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                  Max (LKR)
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  placeholder="Any"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handlePriceFilter} className="w-full" size="sm">
              Apply Price Filter
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )

  return (
    <>
      {/* Desktop Filter */}
      <Card className="hidden lg:block sticky top-24">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterContent />
        </CardContent>
      </Card>

      {/* Mobile Filter Button & Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 flex flex-col">
            <SheetHeader className="shrink-0">
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex-1 overflow-y-auto pb-8">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
