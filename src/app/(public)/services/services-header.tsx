'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ServicesHeaderProps {
  totalServices: number
}

export function ServicesHeader({ totalServices }: ServicesHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isSearching, setIsSearching] = useState(false)

  // Debounced search - updates URL after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get('search') || ''

      // Only update if the search query has changed
      if (searchQuery !== currentSearch) {
        setIsSearching(true)
        const params = new URLSearchParams(searchParams.toString())

        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim())
        } else {
          params.delete('search')
        }

        router.push(`/services?${params.toString()}`)

        // Small delay to show loading state
        setTimeout(() => setIsSearching(false), 300)
      }
    }, 400) // 400ms debounce delay

    return () => clearTimeout(timer)
  }, [searchQuery, searchParams, router])

  const clearSearch = () => {
    setSearchQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Immediate search on Enter key
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }
    router.push(`/services?${params.toString()}`)
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container py-8 md:py-12 lg:py-16 px-4">
        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Our Services
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Professional IT services to keep your business running smoothly.
            From maintenance to complete solutions.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-2">
          <div className="relative">
            {isSearching ? (
              <Loader2 className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary animate-spin" />
            ) : (
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            )}
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 pr-20 sm:pr-24 h-12 sm:h-14 text-base sm:text-lg bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-16 sm:right-20 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 rounded-full hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-9 sm:h-10 px-3 sm:px-4"
            >
              Search
            </Button>
          </div>
          <p className="text-center text-xs sm:text-sm text-slate-400 mt-2">
            Start typing to search instantly...
          </p>
        </form>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-slate-300 px-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-400" />
            <span>{totalServices}+ Services</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-400" />
            <span>2-3hr Response</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-400" />
            <span>Island-wide</span>
          </div>
        </div>
      </div>
    </div>
  )
}
