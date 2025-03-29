"use server"

import * as pdf2json from "pdf2json"
import fs from "fs"
import { ActionState } from "@/types"
import path from "path"
import os from "os"

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
 * Extract text directly from PDF data structure
 * This is a fallback method when getRawTextContent() returns empty
 */
function extractTextFromPdfData(pdfData: any): string {
  try {
    logger.debug("Attempting direct text extraction from PDF data")
    let extractedText = ""

    // Navigate the PDF data structure to extract text
    if (pdfData && pdfData.Pages && Array.isArray(pdfData.Pages)) {
      pdfData.Pages.forEach((page: any, pageIndex: number) => {
        if (page.Texts && Array.isArray(page.Texts)) {
          logger.debug(
            `Page ${pageIndex + 1} has ${page.Texts.length} text elements`
          )

          page.Texts.forEach((textElement: any) => {
            if (textElement.R && Array.isArray(textElement.R)) {
              textElement.R.forEach((textFragment: any) => {
                if (textFragment.T) {
                  // Decode the URI-encoded text
                  const decodedText = decodeURIComponent(textFragment.T)
                  extractedText += decodedText + " "
                }
              })
            }
          })
          extractedText += "\n\n" // Add paragraph breaks between pages
        }
      })
    }

    logger.debug(`Directly extracted ${extractedText.length} characters`)
    return extractedText.trim()
  } catch (error) {
    logger.error("Error in direct text extraction:", error)
    return ""
  }
}

/**
 * Parse a PDF from a Buffer (server-side)
 * @param buffer Buffer containing PDF data
 * @returns Extracted text content as string
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string | null> {
  try {
    logger.debug(`Parsing PDF buffer, size: ${buffer.length} bytes`)

    return new Promise((resolve, reject) => {
      const pdfParser = new pdf2json.default()

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        logger.error("PDF parsing error:", errData.parserError)
        reject(errData.parserError)
      })

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          logger.debug("PDF parsing completed")

          // First try using the built-in text extraction
          let rawText = pdfParser.getRawTextContent()

          // If no text was extracted, try the fallback method
          if (!rawText || rawText.trim().length === 0) {
            logger.warn(
              "Built-in text extraction returned empty result, trying fallback method"
            )
            rawText = extractTextFromPdfData(pdfData)
          }

          logger.debug(`Extracted ${rawText.length} characters of text`)

          if (rawText.length === 0) {
            logger.warn("Could not extract any text from the PDF")
          }

          resolve(rawText)
        } catch (err) {
          logger.error("Error extracting text from PDF:", err)
          reject(err)
        }
      })

      // Use parseBuffer for buffer data
      pdfParser.parseBuffer(buffer)
    })
  } catch (error) {
    logger.error("Error in parsePdfBuffer:", error)
    return null
  }
}

/**
 * Parse a PDF from a File object (server-side)
 * @param file File object from form upload
 * @returns Extracted text content as string
 */
export async function parseResumeFromFile(file: File): Promise<string | null> {
  try {
    logger.info(
      `Parsing resume file: ${file.name} (${file.size} bytes, ${file.type})`
    )

    // Only process PDF files
    if (file.type !== "application/pdf") {
      logger.warn(
        `Unsupported file type: ${file.type}. Only PDF files are supported.`
      )
      return null
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return parsePdfBuffer(buffer)
  } catch (error) {
    logger.error("Error in parseResumeFromFile:", error)
    return null
  }
}

/**
 * Parse a PDF from a URL (server-side)
 * @param url URL of the PDF file
 * @returns Extracted text content as string
 */
export async function parseResumeFromUrl(url: string): Promise<string | null> {
  try {
    logger.info(`Fetching PDF from URL: ${url}`)
    const response = await fetch(url)

    // Verify that we got a PDF
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/pdf")) {
      logger.warn(`URL did not return a PDF file. Content-Type: ${contentType}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return parsePdfBuffer(buffer)
  } catch (error) {
    logger.error("Error in parseResumeFromUrl:", error)
    return null
  }
}
