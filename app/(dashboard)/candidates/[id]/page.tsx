import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getCandidateAction } from "@/actions/db/candidates-actions"
import { getNotesByCandidateIdAction } from "@/actions/db/notes-actions"
import CandidateHeader from "./_components/candidate-header"
import NoteForm from "./_components/note-form"
import NotesTimeline from "./_components/notes-timeline"
import { Skeleton } from "@/components/ui/skeleton"

interface CandidateDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CandidateDetailPage({
  params
}: CandidateDetailPageProps) {
  const { id } = await params

  const { data: candidate, isSuccess } = await getCandidateAction(id)

  if (!isSuccess || !candidate) {
    notFound()
  }

  return (
    <main className="container px-4 py-6 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <CandidateHeader candidate={candidate} />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Notes Column (Left) */}
        <div className="space-y-6 lg:col-span-5">
          <NoteForm candidateId={id} />
          <Suspense fallback={<NotesTimelineSkeleton />}>
            <NotesTimelineFetcher candidateId={id} />
          </Suspense>
        </div>

        {/* Future Content Column (Right) */}
        <div className="lg:col-span-7">
          {/* Placeholder for future content like:
              - Activity history
              - Linked job positions
              - Related candidates
              - Document viewer
          */}
        </div>
      </div>
    </main>
  )
}

// NotesTimelineFetcher remains the same
async function NotesTimelineFetcher({ candidateId }: { candidateId: string }) {
  const { data: notes, isSuccess } =
    await getNotesByCandidateIdAction(candidateId)

  if (!isSuccess) {
    return (
      <div className="text-destructive rounded-lg border p-6 text-center">
        Failed to load notes.
      </div>
    )
  }

  return <NotesTimeline notes={notes || []} />
}

// CandidateHeaderSkeleton remains the same
async function CandidateHeaderSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-lg border p-6">
      <div className="mb-4 h-7 w-40 rounded bg-gray-200"></div>
      <div className="mb-2 flex flex-wrap gap-2">
        <div className="h-5 w-20 rounded bg-gray-200"></div>
        <div className="h-5 w-24 rounded bg-gray-200"></div>
      </div>
      <div className="mb-4 h-5 w-64 rounded bg-gray-200"></div>
      <div className="h-10 w-full rounded bg-gray-200"></div>{" "}
      {/* Placeholder for contact/links */}
    </div>
  )
}

// NotesTimelineSkeleton remains the same
async function NotesTimelineSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>{" "}
      {/* Title Skeleton */}
      {[1, 2, 3].map(i => (
        <div key={i} className="border-border/50 relative mb-8 border-l-2 pl-6">
          {/* Date Marker Skeleton */}
          <div className="absolute -left-[11px] mt-1.5 flex items-center">
            <Skeleton className="ring-background size-5 rounded-full bg-gray-300 ring-4" />
          </div>
          <div className="mb-3 ml-6">
            <Skeleton className="h-4 w-24 rounded bg-gray-300" />
          </div>
          {/* Note Skeleton */}
          <div className="ml-6 space-y-4">
            <div className="relative pl-6">
              <div className="ring-background absolute -left-[31px] mt-[13px] size-2 rounded-full bg-gray-400 ring-2"></div>
              <div className="bg-card rounded-lg border p-3 shadow-sm">
                <div className="mb-1.5 flex justify-between">
                  <Skeleton className="h-3 w-20 rounded bg-gray-200" />
                </div>
                <Skeleton className="h-12 w-full rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
