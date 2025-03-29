"use client"

import { jobTypeEnum } from "@/db/schema/candidates-schema"
import { cn } from "@/lib/utils"

type JobType = (typeof jobTypeEnum.enumValues)[number]

const jobTypeColors: Record<JobType, string> = {
  software_engineer: "bg-blue-100 text-blue-800 border-blue-300",
  data_scientist: "bg-purple-100 text-purple-800 border-purple-300",
  product_manager: "bg-green-100 text-green-800 border-green-300",
  designer: "bg-pink-100 text-pink-800 border-pink-300",
  devops: "bg-orange-100 text-orange-800 border-orange-300",
  qa_engineer: "bg-yellow-100 text-yellow-800 border-yellow-300",
  frontend_developer: "bg-indigo-100 text-indigo-800 border-indigo-300",
  backend_developer: "bg-cyan-100 text-cyan-800 border-cyan-300",
  fullstack_developer: "bg-violet-100 text-violet-800 border-violet-300",
  mobile_developer: "bg-emerald-100 text-emerald-800 border-emerald-300",
  ml_engineer: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
  other: "bg-gray-100 text-gray-800 border-gray-300"
}

const jobTypeLabels: Record<JobType, string> = {
  software_engineer: "Software Engineer",
  data_scientist: "Data Scientist",
  product_manager: "Product Manager",
  designer: "Designer",
  devops: "DevOps",
  qa_engineer: "QA Engineer",
  frontend_developer: "Frontend Developer",
  backend_developer: "Backend Developer",
  fullstack_developer: "Fullstack Developer",
  mobile_developer: "Mobile Developer",
  ml_engineer: "ML Engineer",
  other: "Other"
}

interface CandidateTagProps {
  jobType: JobType
  className?: string
}

export default function CandidateTag({
  jobType,
  className
}: CandidateTagProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        jobTypeColors[jobType],
        className
      )}
    >
      {jobTypeLabels[jobType]}
    </div>
  )
}
