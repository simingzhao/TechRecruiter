"use server"

import { createClient } from "@supabase/supabase-js"
import { ActionState } from "@/types"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Upload a resume file to Supabase storage
export async function uploadResumeStorage(
  userId: string,
  file: File
): Promise<ActionState<{ path: string }>> {
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const sanitizedFileName = file.name
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-zA-Z0-9-]/g, "-") // Replace special chars with hyphens
    const fileName = `${timestamp}-${sanitizedFileName}.${extension}`
    
    // Store in user-specific folder with sanitized path
    const path = `${userId.replace(/[^a-zA-Z0-9-]/g, "-")}/resumes/${fileName}`

    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(path, file, {
        upsert: false,
        contentType: file.type
      })

    if (error) throw error

    return {
      isSuccess: true,
      message: "Resume uploaded successfully",
      data: { path: data.path }
    }
  } catch (error) {
    console.error("Error uploading resume:", error)
    return { isSuccess: false, message: "Failed to upload resume" }
  }
}

// Get a temporary URL to access a resume file
export async function getResumeUrlStorage(
  path: string
): Promise<ActionState<string>> {
  try {
    console.log(`[Storage] Attempting to get signed URL for: ${path}`)
    
    // Verify the file exists first
    const { data: fileExists, error: existsError } = await supabase
      .storage
      .from("resumes")
      .list(path.split('/').slice(0, -1).join('/'))
    
    if (existsError) {
      console.error(`[Storage] Error checking if file exists:`, existsError)
      return { 
        isSuccess: false, 
        message: `Error checking if file exists: ${existsError.message}` 
      }
    }
    
    const fileName = path.split('/').pop()
    if (!fileExists || !fileExists.find(file => file.name === fileName)) {
      console.error(`[Storage] File not found: ${path}`)
      return { 
        isSuccess: false, 
        message: `Resume file not found in storage` 
      }
    }
    
    // Now get the signed URL
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(path, 604800) // 7 days expiry (604800 seconds)

    if (error) {
      console.error(`[Storage] Error creating signed URL:`, error)
      throw error
    }

    console.log(`[Storage] Successfully generated URL for: ${path}`)
    return {
      isSuccess: true,
      message: "Resume URL generated successfully",
      data: data.signedUrl
    }
  } catch (error: any) {
    console.error(`[Storage] Error getting resume URL for path ${path}:`, error)
    return { 
      isSuccess: false, 
      message: `Failed to get resume URL: ${error.message}` 
    }
  }
}

// Delete a resume file from storage
export async function deleteResumeStorage(
  path: string
): Promise<ActionState<void>> {
  try {
    const { error } = await supabase.storage
      .from("resumes")
      .remove([path])

    if (error) throw error

    return {
      isSuccess: true,
      message: "Resume deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting resume:", error)
    return { isSuccess: false, message: "Failed to delete resume" }
  }
} 