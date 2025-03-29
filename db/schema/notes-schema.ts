import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { candidatesTable } from "./candidates-schema"

export const notesTable = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  candidateId: uuid("candidate_id")
    .references(() => candidatesTable.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertNote = typeof notesTable.$inferInsert
export type SelectNote = typeof notesTable.$inferSelect
