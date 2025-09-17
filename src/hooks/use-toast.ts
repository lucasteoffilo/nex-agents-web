import * as React from "react"

import { ToastAction } from "@/components/ui/toast"
import { toast } from "sonner"

export function useToast() {
  const [toasts, setToasts] = React.useState<any[]>([])
  const [paused, setPaused] = React.useState(false)

  const addToast = React.useCallback((toast: any) => {
    setToasts((prev) => [toast, ...prev])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  React.useEffect(() => {
    if (paused) return

    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        const [toastItem, ...rest] = toasts
        toast(toastItem.title || '', { description: toastItem.description })
        setToasts(rest)
      }, toasts[0]?.duration || 3000)

      return () => clearTimeout(timer)
    }
  }, [toasts, paused])

  return {
    toast: addToast,
    dismiss: removeToast,
    toasts,
    setPaused,
  }
}