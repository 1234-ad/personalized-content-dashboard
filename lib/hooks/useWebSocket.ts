'use client'

import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addContent, updateContent } from '../features/contentSlice'

interface WebSocketMessage {
  type: 'content_update' | 'new_content' | 'trending_update'
  data: any
}

interface UseWebSocketOptions {
  url?: string
  enabled?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    enabled = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options

  const dispatch = useDispatch()
  const ws = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout>()
  
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  const connect = () => {
    if (!enabled || ws.current?.readyState === WebSocket.OPEN) return

    try {
      setConnectionStatus('connecting')
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        
        // Send initial subscription message
        ws.current?.send(JSON.stringify({
          type: 'subscribe',
          channels: ['content_updates', 'trending']
        }))
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setConnectionStatus('disconnected')
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect()
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('error')
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('error')
      scheduleReconnect()
    }
  }

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect')
      ws.current = null
    }
    
    setConnectionStatus('disconnected')
  }

  const scheduleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      return
    }

    reconnectAttempts.current++
    console.log(`Scheduling reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`)
    
    reconnectTimeout.current = setTimeout(() => {
      connect()
    }, reconnectInterval)
  }

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'new_content':
        // Add new content to the feed
        dispatch(addContent(message.data))
        break
        
      case 'content_update':
        // Update existing content
        dispatch(updateContent(message.data))
        break
        
      case 'trending_update':
        // Handle trending content updates
        console.log('Trending update received:', message.data)
        break
        
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  const sendMessage = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
      return true
    }
    return false
  }

  // Mock WebSocket server simulation for demo purposes
  const startMockUpdates = () => {
    const mockMessages = [
      {
        type: 'new_content' as const,
        data: {
          id: `mock-${Date.now()}`,
          type: 'news',
          title: 'Breaking: Real-time Update Received!',
          description: 'This content was delivered via WebSocket connection.',
          image: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Live+Update',
          url: '#',
          timestamp: new Date().toISOString()
        }
      },
      {
        type: 'trending_update' as const,
        data: {
          category: 'technology',
          trending: ['AI', 'WebSocket', 'Real-time', 'React']
        }
      }
    ]

    // Simulate receiving messages every 30 seconds
    const interval = setInterval(() => {
      if (connectionStatus === 'connected') {
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
        setLastMessage(randomMessage)
        handleMessage(randomMessage)
      }
    }, 30000)

    return () => clearInterval(interval)
  }

  useEffect(() => {
    if (enabled) {
      connect()
      
      // Start mock updates for demo
      const cleanup = startMockUpdates()
      
      return () => {
        cleanup()
        disconnect()
      }
    }
    
    return disconnect
  }, [enabled, url])

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    isConnected: connectionStatus === 'connected'
  }
}