"use server"

import { currentUser } from "@clerk/nextjs/server"
import { ActionState } from "@/types"
import { uploadResumeStorage, getResumeUrlStorage } from "@/actions/storage/resume-storage-actions"
import { parseResumeFromFile } from "@/lib/utils/server-resume-parser"
import { extractResumeData } from "@/lib/utils/extract-resume-data"

/**
 * Parse a resume file and extract data using OpenAI
 * Uploads the file to storage, parses the PDF, and extracts structured data
 */
export async function parseResumeAction(
  file: File
): Promise<ActionState<{
  resumeData: any
  resumeUrl: string
  fileName: string
}>> {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // 1. Upload file to storage
    const uploadResult = await uploadResumeStorage(user.id, file)
    
    if (!uploadResult.isSuccess) {
      return { isSuccess: false, message: uploadResult.message }
    }
    
    // 2. Get file URL
    const urlResult = await getResumeUrlStorage(uploadResult.data.path)
    
    if (!urlResult.isSuccess) {
      return { isSuccess: false, message: urlResult.message }
    }
    
    // 3. Parse PDF content
    const text = await parseResumeFromFile(file)
    
    if (!text) {
      return { isSuccess: false, message: "Failed to parse resume content" }
    }
    
    // 4. Extract structured data with OpenAI
    const extractResult = await extractResumeData(text)
    
    if (!extractResult.isSuccess) {
      return { isSuccess: false, message: extractResult.message }
    }
    
    return {
      isSuccess: true,
      message: "Resume parsed successfully",
      data: {
        resumeData: extractResult.data,
        resumeUrl: urlResult.data,
        fileName: file.name
      }
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    return { isSuccess: false, message: "Failed to parse resume" }
  }
} 