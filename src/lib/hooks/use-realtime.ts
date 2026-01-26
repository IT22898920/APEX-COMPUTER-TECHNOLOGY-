'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type TableName = 'service_tickets' | 'notifications' | 'ticket_notes' | 'orders' | 'products'

interface UseRealtimeOptions {
  table: TableName
  filter?: {
    column: string
    value: string
  }
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInsert?: (payload: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate?: (payload: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDelete?: (payload: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (payload: any, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
}

export function useRealtime({
  table,
  filter,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Store callbacks in refs to avoid dependency issues
  const onInsertRef = useRef(onInsert)
  const onUpdateRef = useRef(onUpdate)
  const onDeleteRef = useRef(onDelete)
  const onChangeRef = useRef(onChange)

  // Update refs when callbacks change
  useEffect(() => {
    onInsertRef.current = onInsert
    onUpdateRef.current = onUpdate
    onDeleteRef.current = onDelete
    onChangeRef.current = onChange
  }, [onInsert, onUpdate, onDelete, onChange])

  useEffect(() => {
    const supabase = createClient()

    const channelName = filter
      ? `${table}:${filter.column}=eq.${filter.value}`
      : `${table}:all`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePayload = (payload: any) => {
      const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE'
      const data = payload.new || payload.old

      if (onChangeRef.current) {
        onChangeRef.current(data, eventType)
      }

      switch (eventType) {
        case 'INSERT':
          onInsertRef.current?.(data)
          break
        case 'UPDATE':
          onUpdateRef.current?.(data)
          break
        case 'DELETE':
          onDeleteRef.current?.(payload.old)
          break
      }
    }

    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as 'system',
        {
          event,
          schema: 'public',
          table,
          ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        handlePayload
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = realtimeChannel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [table, filter?.column, filter?.value, event])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      const supabase = createClient()
      supabase.removeChannel(channelRef.current)
      setIsConnected(false)
    }
  }, [])

  return {
    isConnected,
    unsubscribe,
  }
}

// Hook for notifications
export function useNotifications(userId?: string) {
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch initial unread count
  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const fetchUnreadCount = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase.from('notifications') as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()
  }, [userId])

  // Subscribe to new notifications
  useRealtime({
    table: 'notifications',
    filter: userId ? { column: 'user_id', value: userId } : undefined,
    onInsert: useCallback(() => {
      setUnreadCount((prev) => prev + 1)
    }, []),
    onUpdate: useCallback((notification: { is_read?: boolean }) => {
      if (notification?.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    }, []),
  })

  const markAsRead = useCallback(async (notificationId: string) => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('notifications') as any)
      .update({ is_read: true })
      .eq('id', notificationId)
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('notifications') as any)
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setUnreadCount(0)
  }, [userId])

  return {
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
}
