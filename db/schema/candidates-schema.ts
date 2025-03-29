import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

// Define job type enum
export const jobTypeEnum = pgEnum("job_type", [
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
])

// Define candidate status enum
export const statusEnum = pgEnum("status", [
  "new",
  "contacted",
  "interviewing",
  "offered",
  "hired",
  "rejected",
  "on_hold",
  "not_interested"
])

export const candidatesTable = pgTable("candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  wechat: text("wechat"),
  jobType: jobTypeEnum("job_type").notNull(),
  currentCompany: text("current_company"),
  school: text("school"),
  linkedinUrl: text("linkedin_url"),
  googleScholar: text("google_scholar"),
  status: statusEnum("status").notNull().default("new"),
  resumeUrl: text("resume_url"),
  resumeFilename: text("resume_filename"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertCandidate = typeof candidatesTable.$inferInsert
export type SelectCandidate = typeof candidatesTable.$inferSelect
