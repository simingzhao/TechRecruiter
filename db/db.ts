/*
<ai_context>
Initializes the database connection and schema for the app.
</ai_context>
*/

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import {
  candidatesTable,
  notesTable,
  profilesTable,
  todosTable
} from "@/db/schema"

// Check for required environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined")
}

// Create postgres connection
const client = postgres(process.env.DATABASE_URL)

// Create database schema object
const schema = {
  candidates: candidatesTable,
  notes: notesTable,
  profiles: profilesTable,
  todos: todosTable
}

// Create drizzle client
export const db = drizzle(client, { schema })
