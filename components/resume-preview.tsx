"use client"

import { useEffect, useState } from "react"
import { getResumeUrlStorage } from "@/actions/storage/resume-storage-actions"
import { FileText, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResumePreviewProps {
  resumePath: string | null
  resumeFilename: string | null
  className?: string
}

export default function ResumePreview({
  resumePath,
  resumeFilename,
  className
}: ResumePreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    async function loadResumeUrl() {
      if (!resumePath) {
        setPreviewUrl(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await getResumeUrlStorage(resumePath)

        if (!response.isSuccess || !response.data) {
          setError("Unable to load resume file")
          setPreviewUrl(null)
          return
        }

        // Ensure we have a valid URL
        try {
          new URL(response.data)
          setPreviewUrl(response.data)
        } catch {
          console.error("Invalid URL received:", response.data)
          setError("Invalid resume URL")
        }
      } catch (err) {
        console.error("Error loading resume:", err)
        setError("Failed to load resume preview")
      } finally {
        setIsLoading(false)
      }
    }

    loadResumeUrl()
  }, [resumePath])

  if (!resumePath || !resumeFilename) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border bg-gray-50 p-6 ${className}`}
      >
        <div className="text-center text-gray-500">
          <FileText className="mx-auto mb-2 size-10" />
          <p>No resume available</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border bg-gray-50 p-6 ${className}`}
      >
        <div className="text-center text-gray-500">
          <Loader2 className="mx-auto mb-2 size-10 animate-spin" />
          <p>Loading resume...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border bg-gray-50 p-6 ${className}`}
      >
        <div className="text-center text-gray-500">
          <FileText className="mx-auto mb-2 size-10" />
          <p className="mb-2">{error}</p>
          <p className="mb-4 text-sm text-gray-400">
            {resumeFilename} - The file may be inaccessible or have been deleted
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!previewUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border bg-gray-50 p-6 ${className}`}
      >
        <div className="text-center text-gray-500">
          <FileText className="mx-auto mb-2 size-10" />
          <p className="mb-2">Preview not available</p>
          <p className="text-sm text-gray-400">{resumeFilename}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-md border ${className}`}>
      <div className="flex items-center justify-between border-b bg-gray-100 p-2">
        <span className="max-w-[70%] truncate text-sm font-medium">
          {resumeFilename}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            window.open(previewUrl, "_blank", "noopener,noreferrer")
          }
          className="gap-1"
        >
          Open
          <ExternalLink className="size-3" />
        </Button>
      </div>

      <object
        data={previewUrl}
        type="application/pdf"
        className="h-[500px] w-full"
      >
        <iframe
          src={previewUrl}
          className="h-[500px] w-full"
          title="Resume preview"
        />
      </object>
    </div>
  )
}
