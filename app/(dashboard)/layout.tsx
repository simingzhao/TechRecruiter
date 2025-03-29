// Server component - no need for "use server" directive

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { Building2, Users } from "lucide-react"
import Link from "next/link"
import DashboardNav from "./_components/dashboard-nav"

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNav />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          {children}
        </Suspense>
      </div>
    </div>
  )
}
