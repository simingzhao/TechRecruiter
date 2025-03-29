import { SelectNote } from "@/db/schema"

// Note interface
export interface Note extends SelectNote {
  // Additional properties can be added here if needed
}

// For form inputs
export interface NoteFormData {
  content: string
  candidateId: string
}
