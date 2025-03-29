// Server component without the "use server" directive
// Server components in Next.js App Router shouldn't use "use server"

import {
  getCandidatesAction,
  searchCandidatesAction
} from "@/actions/db/candidates-actions"
import CandidateTable from "./candidate-table"

interface CandidateTableFetcherProps {
  searchQuery?: string
  statusFilter?: string
  jobTypeFilter?: string
}

export default async function CandidateTableFetcher({
  searchQuery,
  statusFilter,
  jobTypeFilter
}: CandidateTableFetcherProps) {
  let candidatesResponse

  if (searchQuery && searchQuery.length > 0) {
    candidatesResponse = await searchCandidatesAction(searchQuery)
  } else {
    candidatesResponse = await getCandidatesAction()
  }

  let candidates = candidatesResponse.isSuccess ? candidatesResponse.data : []

  // Apply filters if provided
  if (statusFilter && statusFilter !== "all") {
    candidates = candidates.filter(
      candidate => candidate.status === statusFilter
    )
  }

  if (jobTypeFilter && jobTypeFilter !== "all") {
    candidates = candidates.filter(
      candidate => candidate.jobType === jobTypeFilter
    )
  }

  return <CandidateTable candidates={candidates} />
}
