import { auth } from "@clerk/nextjs/server"
import {
  exportCandidatesToExcelAction,
  exportFilteredCandidatesAction,
  exportCandidatesAction
} from "@/actions/export-actions"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET handler for exporting all candidates to Excel
 * @param request The request object
 * @returns Excel file response or error
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Export candidates
    const result = await exportCandidatesAction()
    if (!result.isSuccess) {
      return new NextResponse(result.message, { status: 500 })
    }

    // Set headers for file download
    const headers = new Headers()
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    headers.set(
      "Content-Disposition",
      `attachment; filename="candidates-${new Date().toISOString().split("T")[0]}.xlsx"`
    )

    return new NextResponse(result.data, { headers })
  } catch (error) {
    console.error("Error in export route:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/**
 * POST handler for exporting filtered candidates to Excel
 * @param request The request object
 * @returns Excel file response or error
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Parse filter options from request body
    const filterOptions = await request.json()

    // Export filtered candidates
    const result = await exportFilteredCandidatesAction(filterOptions)

    if (!result.isSuccess) {
      return new NextResponse(result.message, { status: 400 })
    }

    // Create response with Excel file
    const buffer = Buffer.from(result.data.base64Data, "base64")

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${result.data.filename}"`,
        "Content-Length": buffer.length.toString()
      }
    })
  } catch (error) {
    console.error("Error in filtered export API route:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
