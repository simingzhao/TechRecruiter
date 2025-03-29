import { db } from "@/db/db"
import { sql } from "drizzle-orm"

export async function checkDatabaseTables() {
  try {
    // Check if candidates table exists
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'candidates'
      );
    `)

    // Parse the result - the exists query returns a single boolean value
    // TypeScript doesn't know the exact shape, so we need to check carefully
    if (result && Array.isArray(result) && result.length > 0) {
      const firstRow = result[0]
      // The EXISTS query returns a boolean in the first column
      return (
        firstRow && typeof firstRow[0] === "boolean" && firstRow[0] === true
      )
    }

    return false
  } catch (error) {
    console.error("Error checking database tables:", error)
    return false
  }
}
