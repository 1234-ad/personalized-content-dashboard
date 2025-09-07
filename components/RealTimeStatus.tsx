'use client'

import { motion } from 'framer-motion'
import { useWebSocket } from '@/lib/hooks/useWebSocket'

export default function RealTimeStatus() {
  const { connectionStatus, isConnected, lastMessage } = useWebSocket()

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Error'
      default:
        return 'Offline'
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Status Indicator */}
      <div className="flex items-center space-x-1">
        <motion.div
          className={`w-2 h-2 rounded-full ${getStatusColor()}`}
          animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {getStatusText()}
        </span>
      </div>

      {/* Last Update Indicator */}
      {lastMessage && isConnected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex items-center space-x-1"
        >
          <motion.div
            className="w-1 h-1 bg-blue-500 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: 3 }}
          />
          <span className="text-xs text-blue-600 dark:text-blue-400">
            New update
          </span>
        </motion.div>
      )}
    </div>
  )
}