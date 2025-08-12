"use client"

import { useBatteryStore } from "@/lib/store"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  const { theme } = useBatteryStore()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          description: "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-400",
        },
      }}
      position="top-center"
      {...props}
    />
  )
}

export { Toaster }