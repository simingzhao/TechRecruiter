"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Briefcase,
  Edit,
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
  AlertTriangle
} from "lucide-react"

import { deleteCandidateAction } from "@/actions/db/candidates-actions"
import { getResumeUrlStorage } from "@/actions/storage/resume-storage-actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import StatusBadge from "@/components/status-badge"
import CandidateTag from "@/components/candidate-tag"
import { SelectCandidate } from "@/db/schema"

interface CandidateHeaderProps {
  candidate: SelectCandidate
}

export default function CandidateHeader({ candidate }: CandidateHeaderProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFetchingResumeUrl, setIsFetchingResumeUrl] = useState(false)
  const [isResumeErrorDialogOpen, setIsResumeErrorDialogOpen] = useState(false)
  const [resumeDebugInfo, setResumeDebugInfo] = useState("")

  const handleViewResume = async () => {
    if (!candidate.resumeUrl) {
      toast.info("No resume uploaded for this candidate.")
      return
    }

    setIsFetchingResumeUrl(true)
    try {
      // Validate the resume URL format
      const resumePath = candidate.resumeUrl.trim()
      if (!resumePath || resumePath === "") {
        toast.error("Invalid resume file path.")
        setIsFetchingResumeUrl(false)
        return
      }

      // If it's already a full URL, open it directly
      if (
        resumePath.startsWith("http://") ||
        resumePath.startsWith("https://")
      ) {
        console.log("Opening already signed URL:", resumePath)
        window.open(resumePath, "_blank", "noopener,noreferrer")
        setIsFetchingResumeUrl(false)
        return
      }

      console.log("Attempting to fetch resume at path:", resumePath)
      let result = await getResumeUrlStorage(resumePath)

      // If first attempt fails, try to fix the path format
      if (!result.isSuccess) {
        console.log("First attempt failed, trying alternative paths")

        // Try alternative 1: If it's just a filename, try with user ID prefix
        if (!resumePath.includes("/")) {
          console.log(
            "Path appears to be just a filename, trying to reconstruct path"
          )
          // Try to get the user ID
          try {
            const userResponse = await fetch("/api/debug-storage")
            const userData = await userResponse.json()
            if (userData.formattedUserId) {
              const correctedPath = `${userData.formattedUserId}/resumes/${resumePath}`
              console.log("Trying reconstructed path:", correctedPath)
              result = await getResumeUrlStorage(correctedPath)
            }
          } catch (e) {
            console.error("Error trying to get user ID:", e)
          }
        }

        // Try alternative 2: Fix path separator if needed
        if (!result.isSuccess && resumePath.includes("\\")) {
          const fixedPath = resumePath.replace(/\\/g, "/")
          console.log("Trying with fixed path separators:", fixedPath)
          result = await getResumeUrlStorage(fixedPath)
        }
      }

      if (result.isSuccess && result.data) {
        // Open in new tab
        window.open(result.data, "_blank", "noopener,noreferrer")
      } else {
        // Show debug dialog with helpful information
        const debugInfo = `
Resume path stored in database: ${resumePath}
Error message: ${result.message || "Unknown error"}

Troubleshooting steps:
1. Check if the file exists in Supabase storage
2. Verify the path format is correct
3. Try re-uploading the resume
        `.trim()

        setResumeDebugInfo(debugInfo)
        setIsResumeErrorDialogOpen(true)

        // Also show the error toast
        if (
          result.message?.includes("not found") ||
          result.message?.includes("Object not found")
        ) {
          toast.error(
            "Resume file was not found in storage. It may have been deleted or moved."
          )
        } else {
          toast.error(result.message || "Failed to get resume URL.")
        }
      }
    } catch (error: any) {
      console.error("Error fetching resume URL:", error)

      // Show debug dialog for errors
      const debugInfo = `
Resume path stored in database: ${candidate.resumeUrl || "No path stored"}
Error: ${error?.message || "Unknown error"}

Troubleshooting steps:
1. Check if the file exists in Supabase storage
2. Verify the path format is correct
3. Try re-uploading the resume
      `.trim()

      setResumeDebugInfo(debugInfo)
      setIsResumeErrorDialogOpen(true)

      // Handle specific error types
      if (
        error?.message?.includes("not found") ||
        error?.message?.includes("Object not found")
      ) {
        toast.error(
          "Resume file could not be found. It may have been deleted or moved."
        )
      } else {
        toast.error("An error occurred while fetching the resume.")
      }
    } finally {
      setIsFetchingResumeUrl(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteCandidateAction(candidate.id)

      if (result.isSuccess) {
        toast.success("Candidate deleted successfully")
        router.push("/candidates")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete candidate")
      console.error(error)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <>
      <motion.div
        className="mb-8 w-full rounded-lg border p-4 sm:p-6"
        initial="hidden"
        animate="visible"
        variants={contentVariants}
      >
        <motion.div
          className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3"
          variants={itemVariants}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="size-8 shrink-0"
            >
              <Link href="/candidates">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <h1 className="truncate text-xl font-bold leading-tight sm:text-2xl">
              {candidate.name}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {candidate.resumeUrl && (
              <Button
                variant="outline"
                className="h-8 gap-1.5 px-2.5"
                size="sm"
                onClick={handleViewResume}
                disabled={isFetchingResumeUrl}
              >
                {isFetchingResumeUrl ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileText className="size-3.5" />
                )}
                <span className="hidden sm:inline">Resume</span>
              </Button>
            )}

            <Button
              variant="outline"
              className="h-8 gap-1.5 px-2.5"
              size="sm"
              asChild
            >
              <Link href={`/candidates/${candidate.id}/edit`}>
                <Edit className="size-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10 h-8 gap-1.5 px-2.5"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="mb-4 flex flex-wrap items-center gap-2"
          variants={itemVariants}
        >
          <CandidateTag jobType={candidate.jobType} />
          <StatusBadge status={candidate.status} />
        </motion.div>

        <motion.div variants={itemVariants} className="pt-1">
          <Separator className="my-3" />
          <div className="text-muted-foreground grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
            {candidate.email && (
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground/70 size-3.5 shrink-0" />
                <a
                  href={`mailto:${candidate.email}`}
                  className="hover:text-primary truncate transition-colors hover:underline"
                >
                  {candidate.email}
                </a>
              </div>
            )}

            {candidate.phone && (
              <div className="flex items-center gap-2">
                <Phone className="text-muted-foreground/70 size-3.5 shrink-0" />
                <a
                  href={`tel:${candidate.phone}`}
                  className="hover:text-primary truncate transition-colors hover:underline"
                >
                  {candidate.phone}
                </a>
              </div>
            )}

            {candidate.wechat && (
              <div className="flex items-center gap-2">
                <MessageSquare className="text-muted-foreground/70 size-3.5 shrink-0" />
                <span className="truncate">{candidate.wechat}</span>
              </div>
            )}

            {candidate.currentCompany && (
              <div className="flex items-center gap-2">
                <Briefcase className="text-muted-foreground/70 size-3.5 shrink-0" />
                <span className="truncate">{candidate.currentCompany}</span>
              </div>
            )}

            {candidate.school && (
              <div className="flex items-center gap-2">
                <GraduationCap className="text-muted-foreground/70 size-4 shrink-0" />
                <span className="truncate">{candidate.school}</span>
              </div>
            )}

            {candidate.linkedinUrl && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-2 truncate hover:underline"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      <span className="truncate">LinkedIn Profile</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{candidate.linkedinUrl}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {candidate.googleScholar && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={candidate.googleScholar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-2 truncate hover:underline"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      <span className="truncate">Google Scholar</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{candidate.googleScholar}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </motion.div>
      </motion.div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this candidate and all
              associated notes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isResumeErrorDialogOpen}
        onOpenChange={setIsResumeErrorDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Resume Access Issue
            </DialogTitle>
            <DialogDescription>
              There was a problem accessing the resume file. The information
              below may help troubleshoot the issue.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted max-h-60 overflow-auto whitespace-pre-wrap rounded-md p-3 font-mono text-xs">
            {resumeDebugInfo}
          </div>

          <DialogFooter className="sm:justify-start">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                variant="secondary"
                onClick={() => setIsResumeErrorDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href={`/candidates/${candidate.id}/edit`}>
                  Edit Candidate
                </Link>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
