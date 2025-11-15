"use client"

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react"
import { Frown, Smile } from "lucide-react"

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
  overlap: true,
  duration: 1500,
})

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root width={{ md: "sm" }} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 flex items-center py-3">
            {toast.type === "success" ? (
              <div className="flex items-center justify-center h-full gap-x-2">
                <div className="w-1 bg-green-500 rounded-full h-8"></div>
                <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full">
                  <div className="flex items-center justify-center w-7 h-7 bg-green-500 rounded-full">
                    <Smile className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ) : null}
            {toast.type === "error" ? (
              <div className="flex items-center justify-center h-full gap-x-2">
                <div className="w-1 bg-red-500 rounded-full h-8"></div>
                <div className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full">
                  <div className="flex items-center justify-center w-7 h-7 bg-red-500 rounded-full">
                    <Frown className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ) : null}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && <Toast.Title className="text-zinc-800 dark:text-zinc-200 text-medium font-medium">{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description className="text-zinc-800 dark:text-zinc-200 text-medium">{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
