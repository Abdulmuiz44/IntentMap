"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function Header({ isFetching }: { isFetching?: boolean }) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
      return (
          <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tighter">INTENTMAP</span>
                </div>
            </div>
          </header>
      )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-all duration-300">
      {isFetching && (
        <div className="absolute top-0 left-0 h-[2px] w-full bg-blue-500/30 overflow-hidden">
            <div className="h-full bg-blue-600 w-1/3 animate-[loading_1s_ease-in-out_infinite]"></div>
        </div>
      )}
      <div className="flex h-16 items-center justify-between px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-sm">
            I
          </div>
          <span className="text-xl font-bold tracking-tighter text-foreground">INTENTMAP</span>
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Moon className="size-5 text-zinc-400" />
          ) : (
            <Sun className="size-5 text-zinc-600" />
          )}
        </button>
      </div>
    </header>
  )
}