"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function Header() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
      return (
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tighter">INTENTMAP</span>
                </div>
            </div>
          </header>
      )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs">
            I
          </div>
          <span className="text-xl font-bold tracking-tighter">INTENTMAP</span>
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
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
