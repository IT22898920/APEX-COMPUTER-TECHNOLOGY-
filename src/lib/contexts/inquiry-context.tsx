'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface InquiryItem {
  id: string
  name: string
  sku: string
  price: number
  image: string | null
  quantity: number
  addedAt: Date
}

interface InquiryContextType {
  items: InquiryItem[]
  addItem: (item: Omit<InquiryItem, 'quantity' | 'addedAt'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearInquiry: () => void
  isInInquiry: (id: string) => boolean
  totalItems: number
  isLoading: boolean
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined)

const STORAGE_KEY = 'apex-inquiry-items'

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InquiryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const supabaseRef = useRef(createClient())
  const syncedRef = useRef(false)
  const userRef = useRef<User | null>(null)

  // Listen for auth changes - runs only once on mount
  useEffect(() => {
    const supabase = supabaseRef.current

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      userRef.current = user
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null
        const previousUser = userRef.current
        userRef.current = newUser
        setUser(newUser)

        // User just logged in - sync localStorage to database
        if (newUser && !previousUser && event === 'SIGNED_IN') {
          syncedRef.current = false // Reset sync flag to trigger sync
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty dependency - only run on mount

  // Load cart items based on auth state
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true)
      const supabase = supabaseRef.current

      if (user) {
        // User is logged in - load from database
        try {
          const { data: cartItems, error } = await (supabase as any)
            .from('cart_items')
            .select(`
              id,
              product_id,
              quantity,
              created_at,
              products (
                id,
                name,
                sku,
                selling_price,
                image_url
              )
            `)
            .eq('user_id', user.id)

          if (error) {
            console.error('Error loading cart from database:', error)
            setIsLoading(false)
            setIsLoaded(true)
            return
          }

          // If user just logged in and has localStorage items, merge them
          if (!syncedRef.current) {
            const localStorageItems = getLocalStorageItems()
            if (localStorageItems.length > 0) {
              await syncLocalStorageToDatabase(localStorageItems, user.id, supabase)
              // Clear localStorage after sync
              localStorage.removeItem(STORAGE_KEY)
              // Reload from database after sync
              const { data: updatedItems } = await (supabase as any)
                .from('cart_items')
                .select(`
                  id,
                  product_id,
                  quantity,
                  created_at,
                  products (
                    id,
                    name,
                    sku,
                    selling_price,
                    image_url
                  )
                `)
                .eq('user_id', user.id)

              if (updatedItems) {
                setItems(mapDatabaseItemsToInquiryItems(updatedItems))
              }
              syncedRef.current = true
              setIsLoading(false)
              setIsLoaded(true)
              return
            }
            syncedRef.current = true
          }

          if (cartItems) {
            setItems(mapDatabaseItemsToInquiryItems(cartItems))
          }
        } catch (error) {
          console.error('Error loading cart:', error)
        }
      } else {
        // User not logged in - use localStorage
        const localItems = getLocalStorageItems()
        setItems(localItems)
      }

      setIsLoading(false)
      setIsLoaded(true)
    }

    loadItems()
  }, [user])

  // Save to localStorage when items change (only for non-logged-in users)
  useEffect(() => {
    if (isLoaded && !user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Error saving inquiry items:', error)
      }
    }
  }, [items, isLoaded, user])

  const getLocalStorageItems = (): InquiryItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }))
      }
    } catch (error) {
      console.error('Error loading localStorage items:', error)
    }
    return []
  }

  const mapDatabaseItemsToInquiryItems = (dbItems: any[]): InquiryItem[] => {
    return dbItems
      .filter((item: any) => item.products) // Filter out items with deleted products
      .map((item: any) => ({
        id: item.products.id,
        name: item.products.name,
        sku: item.products.sku,
        price: item.products.selling_price,
        image: item.products.image_url || null,
        quantity: item.quantity,
        addedAt: new Date(item.created_at),
      }))
  }

  const syncLocalStorageToDatabase = async (
    localItems: InquiryItem[],
    userId: string,
    supabase: any
  ) => {
    for (const item of localItems) {
      // Check if item already exists in database
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', item.id)
        .single()

      if (existing) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id)
      } else {
        // Insert new item
        await supabase.from('cart_items').insert({
          user_id: userId,
          product_id: item.id,
          quantity: item.quantity,
        })
      }
    }
  }

  const addItem = useCallback(
    async (item: Omit<InquiryItem, 'quantity' | 'addedAt'>) => {
      if (user) {
        // Add to database
        const supabase = supabaseRef.current

        // Check if already exists
        const { data: existing } = await (supabase as any)
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', item.id)
          .single()

        if (existing) {
          // Update quantity
          await (supabase as any)
            .from('cart_items')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id)

          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          )
        } else {
          // Insert new
          await (supabase as any).from('cart_items').insert({
            user_id: user.id,
            product_id: item.id,
            quantity: 1,
          })

          setItems((prev) => [...prev, { ...item, quantity: 1, addedAt: new Date() }])
        }
      } else {
        // Add to localStorage state
        setItems((prev) => {
          const existing = prev.find((i) => i.id === item.id)
          if (existing) {
            return prev.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          }
          return [...prev, { ...item, quantity: 1, addedAt: new Date() }]
        })
      }
    },
    [user]
  )

  const removeItem = useCallback(
    async (id: string) => {
      if (user) {
        const supabase = supabaseRef.current
        await (supabase as any)
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id)
      }
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [user]
  )

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(id)
        return
      }

      if (user) {
        const supabase = supabaseRef.current
        await (supabase as any)
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', id)
      }

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      )
    },
    [user, removeItem]
  )

  const clearInquiry = useCallback(async () => {
    if (user) {
      const supabase = supabaseRef.current
      await (supabase as any)
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setItems([])
  }, [user])

  const isInInquiry = useCallback(
    (id: string) => {
      return items.some((item) => item.id === id)
    },
    [items]
  )

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <InquiryContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearInquiry,
        isInInquiry,
        totalItems,
        isLoading,
      }}
    >
      {children}
    </InquiryContext.Provider>
  )
}

export function useInquiry() {
  const context = useContext(InquiryContext)
  if (context === undefined) {
    throw new Error('useInquiry must be used within an InquiryProvider')
  }
  return context
}
