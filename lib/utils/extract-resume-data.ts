"use server"

import OpenAI from "openai"
import { ActionState } from "@/types"
import { jobTypeEnum, statusEnum } from "@/db/schema"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Define the resume data structure
export interface ResumeData {
  name: string
  email: string | null
  phone: string | null
  wechat: string | null
  currentCompany: string | null
  linkedinUrl: string | null
  googleScholar: string | null
  school: string | null
  jobType: (typeof jobTypeEnum.enumValues)[number]
  experience: Array<{
    company?: string
    position?: string
    startDate?: string
    endDate?: string
    description?: string
  }> | null
  education: string[] | null
  skills: string[] | null
}

/**
 * Extract structured data from resume text using OpenAI
 * @param resumeText The raw text content from the parsed resume
 * @returns Structured resume data or error
 */
export async function extractResumeData(
  resumeText: string
): Promise<ActionState<ResumeData>> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { isSuccess: false, message: "OpenAI API key not configured" }
    }

    // Truncate the resume text if it's too long
    const truncatedText = resumeText.slice(0, 15000)

    const systemPrompt = `
      You are an expert resume parser assistant. Extract the following information from the provided resume text:

      - Full name
      - Email address
      - Phone number
      - WeChat ID (if available)
      - Current company or most recent employer
      - LinkedIn URL (if available)
      - Google Scholar URL (if available)
      - Educational institution (most recent)
      - Most appropriate job type from this list: ${jobTypeEnum.enumValues.join(", ")}
      - Work experience (as an array with company, position, dates, and description)
      - Education history (as an array of brief descriptions)
      - Technical and professional skills (as an array)

      If any field is not found in the resume, return null for that field.
      For job type, make your best guess based on the resume content, defaulting to software_engineer if unclear.
      For arrays, limit to the most relevant 3-5 items.
    `

    // Call OpenAI API
    const response = await openai.responses.create({
      model: "gpt-4o-2024-11-20",
      input: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: truncatedText
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "extracted_resume_data",
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: ["string", "null"] },
              phone: { type: ["string", "null"] },
              wechat: { type: ["string", "null"] },
              currentCompany: { type: ["string", "null"] },
              linkedinUrl: { type: ["string", "null"] },
              googleScholar: { type: ["string", "null"] },
              school: { type: ["string", "null"] },
              jobType: {
                type: "string",
                enum: jobTypeEnum.enumValues
              },
              experience: {
                type: ["array", "null"],
                items: {
                  type: "object",
                  properties: {
                    company: { type: "string" },
                    position: { type: "string" },
                    startDate: { type: "string" },
                    endDate: { type: "string" },
                    description: { type: "string" }
                  },
                  required: [
                    "company",
                    "position",
                    "startDate",
                    "endDate",
                    "description"
                  ],
                  additionalProperties: false
                }
              },
              education: {
                type: ["array", "null"],
                items: { type: "string" }
              },
              skills: {
                type: ["array", "null"],
                items: { type: "string" }
              }
            },
            required: [
              "name",
              "email",
              "phone",
              "wechat",
              "currentCompany",
              "linkedinUrl",
              "googleScholar",
              "school",
              "jobType",
              "experience",
              "education",
              "skills"
            ],
            additionalProperties: false
          },
          strict: true
        }
      }
    })

    // Parse the response
    const extractedData = JSON.parse(response.output_text) as ResumeData

    return {
      isSuccess: true,
      message: "Resume data extracted successfully",
      data: extractedData
    }
  } catch (error) {
    console.error("Error extracting resume data:", error)
    return {
      isSuccess: false,
      message: "Failed to extract resume data"
    }
  }
}

/**
 * Helper function to extract essential candidate information
 */
export async function extractCandidateFormData(data: ResumeData) {
  return {
    name: data.name,
    email: data.email || "",
    phone: data.phone || "",
    wechat: data.wechat || "",
    currentCompany: data.currentCompany || "",
    linkedinUrl: data.linkedinUrl || "",
    googleScholar: data.googleScholar || "",
    school: data.school || "",
    jobType: data.jobType,
    // Default status for new candidates
    status: "new" as (typeof statusEnum.enumValues)[number]
  }
}
