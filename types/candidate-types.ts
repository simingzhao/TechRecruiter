import { jobTypeEnum, statusEnum, SelectCandidate } from "@/db/schema"

// Export the enum types
export type JobType = (typeof jobTypeEnum.enumValues)[number]
export type Status = (typeof statusEnum.enumValues)[number]

// Candidate interface
export interface Candidate extends SelectCandidate {
  // Additional properties can be added here if needed
}

// For form inputs
export interface CandidateFormData {
  name: string
  email?: string
  phone?: string
  wechat?: string
  jobType: JobType
  currentCompany?: string
  school?: string
  linkedinUrl?: string
  googleScholar?: string
  status: Status
}
