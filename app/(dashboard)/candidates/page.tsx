import { Suspense } from "react"
import { Metadata } from "next"
import CandidateTableFetcher from "@/app/(dashboard)/_components/candidate-table-fetcher"
import CandidateTableSkeleton from "@/app/(dashboard)/_components/candidate-table-skeleton"
import SearchFilterBar from "@/app/(dashboard)/_components/search-filter-bar"
import AddCandidateButton from "@/app/(dashboard)/_components/add-candidate-button"
import ExportButton from "@/app/(dashboard)/_components/export-button"

export const metadata: Metadata = {
  title: "Candidates | Tech Recruiter CRM",
  description: "Manage and track your candidates"
}

interface CandidatesPageProps {
  searchParams: Promise<{
    q?: string
    status?: string
    jobType?: string
  }>
}

export default async function CandidatesPage({
  searchParams
}: CandidatesPageProps) {
  const { q, status, jobType } = await searchParams

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Candidates</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and track your candidates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
          <AddCandidateButton />
        </div>
      </div>

      <SearchFilterBar className="max-w-3xl" />

      <Suspense fallback={<CandidateTableSkeleton />}>
        <CandidateTableFetcher
          searchQuery={q}
          statusFilter={status}
          jobTypeFilter={jobType}
        />
      </Suspense>
    </div>
  )
}
