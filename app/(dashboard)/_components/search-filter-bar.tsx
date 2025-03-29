"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { jobTypeEnum, statusEnum } from "@/db/schema"
import { Search, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"

export default function SearchFilterBar({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "all")
  const [showClearButton, setShowClearButton] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  // Convert enum values to display labels
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    ...statusEnum.enumValues.map(value => ({
      value,
      label: value
        .replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }))
  ]

  const jobTypeOptions = [
    { value: "all", label: "All Job Types" },
    ...jobTypeEnum.enumValues.map(value => ({
      value,
      label: value
        .replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }))
  ]

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

  // Only run once on client hydration to prevent server/client mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only run on client
  useEffect(() => {
    if (!mounted) return

    // Check if any filters are active
    setShowClearButton(search !== "" || status !== "all" || jobType !== "all")
  }, [search, status, jobType, mounted])

  // Create a new URLSearchParams instance and update the URL
  const updateFilters = useCallback(() => {
    if (!mounted) return

    const params = new URLSearchParams(searchParams)

    if (search) {
      params.set("q", search)
    } else {
      params.delete("q")
    }

    if (status && status !== "all") {
      params.set("status", status)
    } else {
      params.delete("status")
    }

    if (jobType && jobType !== "all") {
      params.set("jobType", jobType)
    } else {
      params.delete("jobType")
    }

    router.push(`${pathname}?${params.toString()}`)
  }, [search, status, jobType, pathname, router, searchParams, mounted])

  // Handle Enter key press in search input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      updateFilters()
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearch("")
    setStatus("all")
    setJobType("all")
    router.push(pathname)
  }

  // Get active filter count for the badge
  const getActiveFilterCount = () => {
    let count = 0
    if (status !== "all") count++
    if (jobType !== "all") count++
    return count
  }

  // Skip rendering until client hydration is complete
  if (!mounted) return null

  const inputVariants = {
    focus: { scale: 1.01, boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.1)" },
    blur: { scale: 1, boxShadow: "none" }
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-gray-500" />
          <motion.div
            whileFocus="focus"
            animate="blur"
            variants={inputVariants}
          >
            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-14"
            />
          </motion.div>
          <div className="absolute right-2 top-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5"
              onClick={updateFilters}
            >
              <Search className="size-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>

        {isSmallScreen ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative size-10 shrink-0"
              >
                <Filter className="size-4" />
                {getActiveFilterCount() > 0 && (
                  <span className="bg-primary text-primary-foreground absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-5">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Filter candidates by status and job type
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col space-y-4 pb-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={status}
                    onValueChange={value => {
                      setStatus(value)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Job Type</label>
                  <Select
                    value={jobType}
                    onValueChange={value => {
                      setJobType(value)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                {showClearButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-1"
                  >
                    <X className="size-3.5" />
                    Clear
                  </Button>
                )}

                <SheetClose asChild>
                  <Button onClick={updateFilters}>Apply Filters</Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
              <Select
                value={status}
                onValueChange={value => {
                  setStatus(value)
                  updateFilters()
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={jobType}
                onValueChange={value => {
                  setJobType(value)
                  updateFilters()
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showClearButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-2 flex items-center gap-1 self-start sm:mt-0"
              >
                <X className="size-3.5" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
