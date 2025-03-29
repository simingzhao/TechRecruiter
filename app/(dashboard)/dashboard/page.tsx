"use server"

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import CandidateTableFetcher from "../_components/candidate-table-fetcher"
import CandidateTableSkeleton from "../_components/candidate-table-skeleton"
import SearchFilterBar from "../_components/search-filter-bar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ArrowRight, Users } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import { getCandidatesAction } from "@/actions/db/candidates-actions"
import AddCandidateButton from "../_components/add-candidate-button"

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; jobType?: string }>
}) {
  const params = await searchParams

  return (
    <div className="container max-w-7xl space-y-8 py-6">
      <Header />

      <SearchFilterBar className="mx-auto max-w-4xl" />

      <Suspense fallback={<CandidateTableSkeleton />}>
        <CandidateTableFetcher
          searchQuery={params.q}
          statusFilter={params.status}
          jobTypeFilter={params.jobType}
        />
      </Suspense>
    </div>
  )
}

async function Header() {
  const user = await currentUser()

  if (!user) return null

  const candidatesResponse = await getCandidatesAction()
  const totalCandidates = candidatesResponse.isSuccess
    ? candidatesResponse.data.length
    : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your candidates and recruitment pipeline
          </p>
        </div>
        <AddCandidateButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidates}</div>
            <p className="text-muted-foreground text-xs">
              {totalCandidates === 1 ? "candidate" : "candidates"} in your
              database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <ArrowRight className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-muted-foreground text-xs">
              Check candidate updates
            </p>
            <Button
              variant="link"
              size="sm"
              asChild
              className="mt-2 h-auto p-0"
            >
              <Link href="/candidates">View all candidates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
