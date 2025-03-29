"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { parseResumeAction } from "@/actions/resume-actions"
import { File, Upload, XCircle, AlertCircle, CheckCircle2 } from "lucide-react"

interface ResumeUploadProps {
  onSuccess: (data: any) => void
  onError?: (error: string) => void
}

export default function ResumeUpload({
  onSuccess,
  onError
}: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const selectedFile = acceptedFiles[0]
    setFile(selectedFile)
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"]
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: fileRejections => {
      const rejection = fileRejections[0]
      if (rejection.errors[0].code === "file-too-large") {
        setError("File is too large. Maximum size is 10MB.")
      } else if (rejection.errors[0].code === "file-invalid-type") {
        setError("Only PDF files are accepted.")
      } else {
        setError(`Upload error: ${rejection.errors[0].message}`)
      }
    }
  })

  useEffect(() => {
    if (file && !uploading && !parsing) {
      handleUpload()
    }
  }, [file])

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Parse the resume
      setParsing(true)
      const result = await parseResumeAction(file)
      clearInterval(interval)
      setUploadProgress(100)

      if (result.isSuccess) {
        onSuccess(result.data)
      } else {
        setError(result.message)
        if (onError) onError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      if (onError) onError("An unexpected error occurred. Please try again.")
    } finally {
      setUploading(false)
      setParsing(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setUploadProgress(0)
    setError(null)
  }

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="text-muted-foreground mb-2 size-10" />
            <h3 className="text-lg font-medium">
              {isDragActive ? "Drop the file here" : "Drag & drop a resume"}
            </h3>
            <p className="text-muted-foreground text-sm">
              or click to browse (PDF only, max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="text-primary size-6" />
              <div>
                <p className="max-w-[180px] truncate text-sm font-medium sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              disabled={uploading || parsing}
            >
              <XCircle className="text-muted-foreground hover:text-destructive size-5" />
            </Button>
          </div>

          {(uploading || parsing) && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-muted-foreground text-xs">
                {uploading && uploadProgress < 100
                  ? `Uploading: ${uploadProgress}%`
                  : "Parsing resume..."}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="size-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
