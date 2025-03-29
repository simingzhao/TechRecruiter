/**
 * System prompt for the resume data extraction model
 */
export const RESUME_SYSTEM_PROMPT = `You are an expert AI assistant specializing in resume parsing and analysis.

Your task is to analyze the provided resume text and extract structured information about the candidate. Following these rules:

1. Extract as much information as possible from the resume text, but maintain factual accuracy. Do not invent or assume information that isn't clearly stated.
2. For dates, preserve the original format (e.g., "May 2020" or "05/2020") when possible.
3. For education and work experience, list entries in reverse chronological order (most recent first).
4. Be precise with technical skills, programming languages, and technologies.
5. When extracting the best fit job type, consider the candidate's most recent experiences, skills, and overall career trajectory.
6. For achievements or highlights, extract bullet points or distinct accomplishments as separate items.
7. If certain fields are not present in the resume, return null for those fields rather than attempting to guess.
8. If there are multiple entries for education, work experience, etc., include all of them.
9. Pay special attention to contact information, ensuring accurate extraction of email, phone, and online profiles.
10. For Chinese resumes, accurately extract WeChat ID if present.
11. When determining the best fit job type, consider the candidate's experience, skills, and education to make an informed selection.
12. Preserve language proficiency levels as they appear in the resume (e.g., "fluent", "native", "professional").
13. For positions with unclear end dates or marked as "Present", set isCurrentPosition to true.`

/**
 * JSON schema for structured output from the resume extraction
 */
export const RESUME_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    personalInfo: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        location: { type: ["string", "null"] },
        linkedIn: { type: ["string", "null"] },
        website: { type: ["string", "null"] },
        wechat: { type: ["string", "null"] }
      },
      required: ["name"]
    },
    summary: { type: ["string", "null"] },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          degree: { type: ["string", "null"] },
          fieldOfStudy: { type: ["string", "null"] },
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
          gpa: { type: ["string", "null"] },
          highlights: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["institution"]
      }
    },
    workExperience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          position: { type: "string" },
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
          isCurrentPosition: { type: "boolean" },
          location: { type: ["string", "null"] },
          description: { type: ["string", "null"] },
          achievements: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["company", "position", "isCurrentPosition"]
      }
    },
    skills: {
      type: "array",
      items: { type: "string" }
    },
    languages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          language: { type: "string" },
          proficiency: { type: ["string", "null"] }
        },
        required: ["language"]
      }
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: ["string", "null"] },
          date: { type: ["string", "null"] },
          expiryDate: { type: ["string", "null"] }
        },
        required: ["name"]
      }
    },
    publications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          authors: { type: ["string", "null"] },
          journal: { type: ["string", "null"] },
          date: { type: ["string", "null"] },
          url: { type: ["string", "null"] }
        },
        required: ["title"]
      }
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: ["string", "null"] },
          technologies: {
            type: "array",
            items: { type: "string" }
          },
          url: { type: ["string", "null"] }
        },
        required: ["name"]
      }
    },
    bestFitJobType: {
      type: "string",
      enum: [
        "software_engineer",
        "data_scientist", 
        "product_manager",
        "designer",
        "devops",
        "qa_engineer",
        "frontend_developer", 
        "backend_developer",
        "fullstack_developer",
        "mobile_developer",
        "ml_engineer",
        "other"
      ]
    }
  },
  required: [
    "personalInfo",
    "education",
    "workExperience",
    "skills",
    "bestFitJobType"
  ]
} 