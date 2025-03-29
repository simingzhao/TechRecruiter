"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { SelectCandidate } from "@/db/schema"
import CandidateTag from "@/components/candidate-tag"
import StatusBadge from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import AddCandidateButton from "./add-candidate-button"

// Animation variants
const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      when: "beforeChildren"
    }
  }
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  hover: { backgroundColor: "rgba(243, 244, 246, 0.8)" }
}

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
}

interface CandidateTableProps {
  candidates: SelectCandidate[]
}

export default function CandidateTable({ candidates }: CandidateTableProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(
    new Set()
  )

  const toggleSelectAll = () => {
    if (selectedCandidates.size === candidates.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(new Set(candidates.map(candidate => candidate.id)))
    }
  }

  const toggleSelectCandidate = (id: string) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCandidates(newSelected)
  }

  if (candidates.length === 0) {
    return (
      <motion.div
        className="flex w-full flex-col items-center justify-center rounded-md border bg-gray-50 p-6 sm:p-12"
        variants={emptyStateVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium">No candidates found</h3>
          <p className="mx-auto mb-4 max-w-sm text-sm text-gray-500">
            Get started by adding your first candidate.
          </p>
          <AddCandidateButton />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedCandidates.size === candidates.length &&
                    candidates.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all candidates"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden md:table-cell">Job Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {candidates.map(candidate => (
                <motion.tr
                  key={candidate.id}
                  className="group"
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.8)" }}
                  layout
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedCandidates.has(candidate.id)}
                      onCheckedChange={() =>
                        toggleSelectCandidate(candidate.id)
                      }
                      aria-label={`Select ${candidate.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="hover:text-primary font-medium transition-colors hover:underline"
                      >
                        {candidate.name}
                      </Link>
                      {candidate.currentCompany && (
                        <span className="text-sm text-gray-500">
                          {candidate.currentCompany}
                        </span>
                      )}
                      <div className="mt-1 space-y-1 md:hidden">
                        <span className="block text-xs text-gray-400">
                          {candidate.email ||
                            candidate.phone ||
                            "No contact information"}
                        </span>
                        <span className="block">
                          <CandidateTag
                            jobType={candidate.jobType}
                            className="!py-0.5 !text-xs"
                          />
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {candidate.email ||
                      candidate.phone ||
                      "No contact information"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <CandidateTag jobType={candidate.jobType} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={candidate.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="hidden items-center justify-end space-x-1 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="size-8 rounded-full"
                        aria-label="View candidate"
                      >
                        <Link href={`/candidates/${candidate.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full"
                            aria-label="More options"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/candidates/${candidate.id}/edit`}>
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            // Implement delete functionality later
                            onClick={() => console.log("Delete:", candidate.id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="block md:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full !justify-center px-2"
                      >
                        <Link href={`/candidates/${candidate.id}`}>View</Link>
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      <div className="text-muted-foreground border-t px-4 py-2 text-center text-sm">
        {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
