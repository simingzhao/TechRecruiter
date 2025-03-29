"use client"

import { PDFParser } from "pdf2json"
import fs from "fs"
import { ActionState } from "@/types"
import path from "path"
import os from "os"
import { log } from "./general-logger"

// Debug flag - set to true to enable verbose logging
const DEBUG = true

/**
 * Logger utility for consistent logging
 */
const logger = {
  debug: (message: string, data?: any) => {
    if (!DEBUG) return
    console.log(`[RESUME-PARSER][DEBUG] ${message}`, data ? data : "")
  },
  info: (message: string, data?: any) => {
    console.log(`[RESUME-PARSER][INFO] ${message}`, data ? data : "")
  },
  warn: (message: string, data?: any) => {
    console.warn(`[RESUME-PARSER][WARN] ${message}`, data ? data : "")
  },
  error: (message: string, error?: any) => {
    console.error(`[RESUME-PARSER][ERROR] ${message}`)
    if (error) {
      if (error instanceof Error) {
        console.error(`[RESUME-PARSER][ERROR] Message: ${error.message}`)
        console.error(`[RESUME-PARSER][ERROR] Stack: ${error.stack}`)
      } else {
        console.error(`[RESUME-PARSER][ERROR] Details:`, error)
      }
    }
  }
}

/**
 * Parses a PDF file from a buffer and extracts the text content
 * @param buffer PDF file as a Buffer
 * @returns Promise with the extracted text content
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string | null> {
  try {
    log("Parsing PDF buffer...")
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser()

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        log("PDF parsing error:", errData.parserError)
        reject(errData.parserError)
      })

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          log("PDF parsing completed")
          const rawText = pdfParser.getRawTextContent()
          resolve(rawText)
        } catch (err) {
          log("Error extracting text from PDF:", err)
          reject(err)
        }
      })

      pdfParser.parseBuffer(buffer)
    })
  } catch (error) {
    log("Error in parsePdfBuffer:", error)
    return null
  }
}

/**
 * Parses a PDF file from a File object (for client-side file uploads)
 * @param file File object representing a PDF file
 * @returns Promise with the extracted text content
 */
export async function parsePdfFile(file: File): Promise<string | null> {
  try {
    log("Converting File to ArrayBuffer...")
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return parsePdfBuffer(buffer)
  } catch (error) {
    log("Error in parsePdfFile:", error)
    return null
  }
}

/**
 * Parses a PDF file from a local path (for server-side processing)
 * @param filePath Path to the PDF file
 * @returns Promise with the extracted text content
 */
export async function parsePdfPath(filePath: string): Promise<string | null> {
  try {
    log(`Reading PDF from path: ${filePath}`)
    const buffer = fs.readFileSync(filePath)
    return parsePdfBuffer(buffer)
  } catch (error) {
    log("Error in parsePdfPath:", error)
    return null
  }
}

/**
 * Saves a file from a remote URL to a temporary file and parses it
 * @param url URL of the PDF file
 * @returns Promise with the extracted text content
 */
export async function parsePdfFromUrl(url: string): Promise<string | null> {
  try {
    log(`Fetching PDF from URL: ${url}`)
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return parsePdfBuffer(buffer)
  } catch (error) {
    log("Error in parsePdfFromUrl:", error)
    return null
  }
}

/**
 * Parses a PDF from a Blob object (for browser environments)
 * @param blob Blob object representing a PDF file
 * @returns Promise with the extracted text content
 */
export async function parseResume(file: File): Promise<string | null> {
  try {
    log(`Parsing resume file: ${file.name} (${file.size} bytes, ${file.type})`)
    return parsePdfFile(file)
  } catch (error) {
    log("Error in parseResume:", error)
    return null
  }
}

/**
 * Extract structured data from PDF
 * @param pdf PDF content as a JSON object from pdf2json
 * @returns Object with structured data extracted from the PDF
 */
export async function extractPdfStructure(pdfData: any): Promise<
  ActionState<{
    pages: number
    forms: any[]
    metadata: {
      title?: string
      author?: string
      subject?: string
      keywords?: string
      creator?: string
      producer?: string
    }
  }>
> {
  logger.debug("Extracting PDF structure from parsed data")

  try {
    // Check if pdfData is valid
    if (!pdfData) {
      logger.error("PDF data is null or undefined")
      return {
        isSuccess: false,
        message: "Invalid PDF data provided"
      }
    }

    // Extract basic structure information
    const pageCount = pdfData.Pages?.length || 0
    logger.debug(`PDF has ${pageCount} pages`)

    const forms = pdfData.AllFieldsTypes || []
    logger.debug(`PDF has ${forms.length} form fields`)

    // Try to extract metadata from pdf2json output
    const metadata = pdfData.Metadata || {}
    logger.debug("Extracted metadata", metadata)

    const structuredData = {
      pages: pageCount,
      forms: forms,
      metadata: {
        title: metadata.Title || "",
        author: metadata.Author || "",
        subject: metadata.Subject || "",
        keywords: metadata.Keywords || "",
        creator: metadata.Creator || "",
        producer: metadata.Producer || ""
      }
    }

    logger.info("PDF structure extracted successfully")
    logger.debug("Extracted structure data", structuredData)

    return {
      isSuccess: true,
      message: "PDF structure extracted successfully",
      data: structuredData
    }
  } catch (error) {
    logger.error("Error extracting PDF structure", error)
    return {
      isSuccess: false,
      message: "Failed to extract PDF structure"
    }
  }
}

/**
 * Get full PDF data as JSON for advanced processing
 * @param buffer PDF file as a Buffer
 * @returns Promise with the full PDF data as JSON
 */
export async function getPdfAsJson(buffer: Buffer): Promise<ActionState<any>> {
  logger.info(
    `Getting full JSON representation of PDF, buffer size: ${buffer.length} bytes`
  )

  try {
    const pdfParser = new PDFParser()

    return new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", errData => {
        logger.error("PDF parsing error in getPdfAsJson", errData.parserError)
        reject(errData.parserError)
      })

      pdfParser.on("pdfParser_dataReady", pdfData => {
        try {
          logger.debug("PDF parser data ready event received in getPdfAsJson")

          // Log some basic info about the parsed data
          logger.debug(
            `PDF parsed to JSON. Page count: ${pdfData.Pages?.length || 0}`
          )

          if (DEBUG) {
            // Only in debug mode, log structure of first page (not content)
            if (pdfData.Pages?.length > 0) {
              const firstPageKeys = Object.keys(pdfData.Pages[0])
              logger.debug(
                `First page structure, keys: ${JSON.stringify(firstPageKeys)}`
              )
            }
          }

          logger.info("PDF converted to JSON successfully")
          resolve({
            isSuccess: true,
            message: "PDF converted to JSON successfully",
            data: pdfData
          })
        } catch (error) {
          logger.error("Error converting PDF to JSON in dataReady event", error)
          reject(error)
        }
      })

      logger.debug("Starting buffer parsing for JSON conversion")
      pdfParser.parseBuffer(buffer)
    })
  } catch (error) {
    logger.error("Error in getPdfAsJson", error)
    return {
      isSuccess: false,
      message: "Failed to convert PDF to JSON"
    }
  }
}

// Logging utility for debugging
export async function logParsedResume(text: string): Promise<void> {
  const truncated = text.length > 500 ? text.substring(0, 500) + "..." : text
  log("Parsed resume text (truncated):", truncated)

  // Log character count and basic stats
  const lines = text.split("\n").length
  const words = text.split(/\s+/).length
  log(`Resume stats: ${text.length} chars, ${lines} lines, ${words} words`)
}
