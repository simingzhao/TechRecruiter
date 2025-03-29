"use server"

import * as XLSX from "xlsx"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db/db"
import { candidatesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { and, eq, ilike, inArray } from "drizzle-orm"
import { getCandidatesAction } from "@/actions/db/candidates-actions"
import { SelectCandidate } from "@/db/schema"

// Debug flag - set to true to enable verbose logging
const DEBUG = true

/**
 * Logger utility for consistent logging
 */
const logger = {
  debug: (message: string, data?: any) => {
    if (!DEBUG) return
    console.log(`[EXPORT-ACTIONS][DEBUG] ${message}`, data ? data : "")
  },
  info: (message: string, data?: any) => {
    console.log(`[EXPORT-ACTIONS][INFO] ${message}`, data ? data : "")
  },
  warn: (message: string, data?: any) => {
    console.warn(`[EXPORT-ACTIONS][WARN] ${message}`, data ? data : "")
  },
  error: (message: string, error?: any) => {
    console.error(`[EXPORT-ACTIONS][ERROR] ${message}`)
    if (error) {
      if (error instanceof Error) {
        console.error(`[EXPORT-ACTIONS][ERROR] Message: ${error.message}`)
        console.error(`[EXPORT-ACTIONS][ERROR] Stack: ${error.stack}`)
      } else {
        console.error(`[EXPORT-ACTIONS][ERROR] Details:`, error)
      }
    }
  }
}

/**
 * Export candidates to Excel
 * @param candidateIds Optional array of candidate IDs to export. If not provided, all candidates for the current user will be exported.
 * @returns ActionState with the Excel file data as a base64 string
 */
export async function exportCandidatesToExcelAction(
  candidateIds?: string[]
): Promise<ActionState<{ filename: string; base64Data: string }>> {
  logger.info("Starting export of candidates to Excel")
  
  try {
    // Get the current user
    const { userId } = await auth()
    if (!userId) {
      logger.error("No user ID found")
      return {
        isSuccess: false,
        message: "Authentication required"
      }
    }
    
    // Query candidates
    let candidates
    if (candidateIds && candidateIds.length > 0) {
      logger.debug(`Exporting ${candidateIds.length} specific candidates`)
      candidates = await db.query.candidates.findMany({
        where: and(
          eq(candidatesTable.userId, userId),
          inArray(candidatesTable.id, candidateIds)
        )
      })
    } else {
      logger.debug("Exporting all candidates for current user")
      candidates = await db.query.candidates.findMany({
        where: eq(candidatesTable.userId, userId)
      })
    }
    
    if (!candidates || candidates.length === 0) {
      logger.warn("No candidates found to export")
      return {
        isSuccess: false,
        message: "No candidates found to export"
      }
    }
    
    logger.debug(`Found ${candidates.length} candidates to export`)
    
    // Format data for Excel
    const worksheetData = candidates.map(candidate => ({
      "Name": candidate.name || "",
      "Email": candidate.email || "",
      "Phone": candidate.phone || "",
      "WeChat": candidate.wechat || "",
      "Job Type": candidate.jobType || "",
      "Current Company": candidate.currentCompany || "",
      "School": candidate.school || "",
      "LinkedIn": candidate.linkedinUrl || "",
      "Google Scholar": candidate.googleScholar || "",
      "Status": candidate.status || "",
      "Resume URL": candidate.resumeUrl || "",
      "Created At": candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "",
      "Updated At": candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleDateString() : ""
    }))
    
    logger.debug("Formatted data for Excel export")
    
    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates")
    
    // Auto-size columns
    const columnWidths: { width: number }[] = []
    for (const row of worksheetData) {
      Object.keys(row).forEach((key, i) => {
        const cellValue = String(row[key as keyof typeof row])
        const cellWidth = Math.max(key.length, cellValue.length)
        
        if (!columnWidths[i] || columnWidths[i].width < cellWidth) {
          columnWidths[i] = { width: cellWidth + 2 }
        }
      })
    }
    
    // Apply column widths
    worksheet["!cols"] = columnWidths
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    logger.debug("Generated Excel file buffer")
    
    // Convert to base64
    const base64Data = Buffer.from(excelBuffer).toString("base64")
    logger.info("Excel export completed successfully")
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19)
    const filename = `candidates_export_${timestamp}.xlsx`
    
    return {
      isSuccess: true,
      message: "Candidates exported successfully",
      data: {
        filename,
        base64Data
      }
    }
  } catch (error) {
    logger.error("Error exporting candidates to Excel", error)
    return {
      isSuccess: false,
      message: "Failed to export candidates"
    }
  }
}

/**
 * Export a filtered set of candidates to Excel
 * @param filterOptions Filter criteria for candidates
 * @returns ActionState with the Excel file data as a base64 string
 */
export async function exportFilteredCandidatesAction(
  filterOptions: {
    name?: string
    jobType?: string
    currentCompany?: string
    school?: string
    status?: string
  }
): Promise<ActionState<{ filename: string; base64Data: string }>> {
  logger.info("Starting export of filtered candidates to Excel")
  logger.debug("Filter options:", filterOptions)
  
  try {
    // Get the current user
    const { userId } = await auth()
    if (!userId) {
      logger.error("No user ID found")
      return {
        isSuccess: false,
        message: "Authentication required"
      }
    }
    
    // Build where conditions
    const whereConditions = [eq(candidatesTable.userId, userId)]
    
    if (filterOptions.name) {
      whereConditions.push(ilike(candidatesTable.name, `%${filterOptions.name}%`))
    }
    
    if (filterOptions.jobType) {
      // We need to validate the job type is one of the allowed enum values
      // For simplicity, we'll just use it as-is for now
      whereConditions.push(eq(candidatesTable.jobType, filterOptions.jobType as any))
    }
    
    if (filterOptions.currentCompany) {
      whereConditions.push(ilike(candidatesTable.currentCompany, `%${filterOptions.currentCompany}%`))
    }
    
    if (filterOptions.school) {
      whereConditions.push(ilike(candidatesTable.school, `%${filterOptions.school}%`))
    }
    
    if (filterOptions.status) {
      // We need to validate the status is one of the allowed enum values
      // For simplicity, we'll just use it as-is for now
      whereConditions.push(eq(candidatesTable.status, filterOptions.status as any))
    }
    
    // Execute the query with all conditions
    const candidates = await db.query.candidates.findMany({
      where: and(...whereConditions)
    })
    
    if (!candidates || candidates.length === 0) {
      logger.warn("No candidates found matching the filter criteria")
      return {
        isSuccess: false,
        message: "No candidates found matching the filter criteria"
      }
    }
    
    logger.debug(`Found ${candidates.length} candidates matching the filter criteria`)
    
    // Format data for Excel
    const worksheetData = candidates.map(candidate => ({
      "Name": candidate.name || "",
      "Email": candidate.email || "",
      "Phone": candidate.phone || "",
      "WeChat": candidate.wechat || "",
      "Job Type": candidate.jobType || "",
      "Current Company": candidate.currentCompany || "",
      "School": candidate.school || "",
      "LinkedIn": candidate.linkedinUrl || "",
      "Google Scholar": candidate.googleScholar || "",
      "Status": candidate.status || "",
      "Resume URL": candidate.resumeUrl || "",
      "Created At": candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : "",
      "Updated At": candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleDateString() : ""
    }))
    
    logger.debug("Formatted data for Excel export")
    
    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates")
    
    // Auto-size columns
    const columnWidths: { width: number }[] = []
    for (const row of worksheetData) {
      Object.keys(row).forEach((key, i) => {
        const cellValue = String(row[key as keyof typeof row])
        const cellWidth = Math.max(key.length, cellValue.length)
        
        if (!columnWidths[i] || columnWidths[i].width < cellWidth) {
          columnWidths[i] = { width: cellWidth + 2 }
        }
      })
    }
    
    // Apply column widths
    worksheet["!cols"] = columnWidths
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    logger.debug("Generated Excel file buffer")
    
    // Convert to base64
    const base64Data = Buffer.from(excelBuffer).toString("base64")
    logger.info("Filtered Excel export completed successfully")
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19)
    const filename = `candidates_filtered_export_${timestamp}.xlsx`
    
    return {
      isSuccess: true,
      message: "Filtered candidates exported successfully",
      data: {
        filename,
        base64Data
      }
    }
  } catch (error) {
    logger.error("Error exporting filtered candidates to Excel", error)
    return {
      isSuccess: false,
      message: "Failed to export filtered candidates"
    }
  }
}

export async function exportCandidatesAction(): Promise<ActionState<Buffer>> {
  try {
    // Get all candidates
    const result = await getCandidatesAction()
    if (!result.isSuccess) {
      throw new Error(result.message)
    }

    const candidates = result.data

    // Transform data for Excel
    const excelData = candidates.map((candidate: SelectCandidate) => ({
      Name: candidate.name,
      Email: candidate.email,
      Phone: candidate.phone || "",
      WeChat: candidate.wechat || "",
      "Current Company": candidate.currentCompany || "",
      School: candidate.school || "",
      "Job Type": candidate.jobType,
      Status: candidate.status,
      "LinkedIn URL": candidate.linkedinUrl || "",
      "Google Scholar": candidate.googleScholar || "",
      "Created At": new Date(candidate.createdAt).toLocaleDateString(),
      "Updated At": candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleDateString() : ""
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates")

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return {
      isSuccess: true,
      message: "Candidates exported successfully",
      data: buffer
    }
  } catch (error) {
    console.error("Error exporting candidates:", error)
    return { isSuccess: false, message: "Failed to export candidates" }
  }
} 