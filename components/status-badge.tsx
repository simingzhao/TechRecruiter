"use client"

import { statusEnum } from "@/db/schema/candidates-schema"
import { cn } from "@/lib/utils"

type Status = (typeof statusEnum.enumValues)[number]

const statusColors: Record<Status, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-300",
  contacted: "bg-indigo-100 text-indigo-800 border-indigo-300",
  interviewing: "bg-purple-100 text-purple-800 border-purple-300",
  offered: "bg-amber-100 text-amber-800 border-amber-300",
  hired: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  on_hold: "bg-gray-100 text-gray-800 border-gray-300",
  not_interested: "bg-rose-100 text-rose-800 border-rose-300"
}

const statusLabels: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  interviewing: "Interviewing",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
  on_hold: "On Hold",
  not_interested: "Not Interested"
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusColors[status],
        className
      )}
    >
      {statusLabels[status]}
    </div>
  )
}
