"use client"

import { Building2, Menu, Users } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardNav() {
  return (
    <>
      {/* Sidebar for large screens */}
      <div className="hidden w-64 border-r bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/candidates" className="flex items-center gap-2">
              <Building2 className="text-primary size-6" />
              <span className="text-lg font-bold">RecruiterCRM</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <NavLink
              href="/candidates"
              icon={<Users className="size-4" />}
              label="Candidates"
            />
          </nav>

          <div className="border-t p-4">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet>
        <div className="flex h-16 items-center border-b px-4 md:hidden">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="size-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>

          <div className="flex flex-1 items-center gap-2">
            <Building2 className="text-primary size-6" />
            <span className="text-lg font-bold">RecruiterCRM</span>
          </div>

          <UserButton afterSignOutUrl="/sign-in" />
        </div>

        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/candidates" className="flex items-center gap-2">
                <Building2 className="text-primary size-6" />
                <span className="text-lg font-bold">RecruiterCRM</span>
              </Link>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              <NavLink
                href="/candidates"
                icon={<Users className="size-4" />}
                label="Candidates"
              />
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function NavLink({
  href,
  icon,
  label
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className="hover:text-primary flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  )
}
