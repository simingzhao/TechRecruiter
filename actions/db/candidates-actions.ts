"use server"

import { db } from "@/db/db"
import { candidatesTable, InsertCandidate, SelectCandidate } from "@/db/schema"
import { ActionState } from "@/types"
import { currentUser } from "@clerk/nextjs/server"
import { and, asc, desc, eq, ilike, or } from "drizzle-orm"

// CREATE
export async function createCandidateAction(
  candidate: Omit<InsertCandidate, "userId">
): Promise<ActionState<SelectCandidate>> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const [newCandidate] = await db
      .insert(candidatesTable)
      .values({ ...candidate, userId: user.id })
      .returning()

    return {
      isSuccess: true,
      message: "Candidate created successfully",
      data: newCandidate
    }
  } catch (error) {
    console.error("Error creating candidate:", error)
    return { isSuccess: false, message: "Failed to create candidate" }
  }
}

// READ
export async function getCandidateAction(
  id: string
): Promise<ActionState<SelectCandidate>> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const candidate = await db.query.candidates.findFirst({
      where: and(eq(candidatesTable.id, id), eq(candidatesTable.userId, user.id))
    })

    if (!candidate) {
      return { isSuccess: false, message: "Candidate not found" }
    }

    return {
      isSuccess: true,
      message: "Candidate retrieved successfully",
      data: candidate
    }
  } catch (error) {
    console.error("Error getting candidate:", error)
    return { isSuccess: false, message: "Failed to get candidate" }
  }
}

export async function getCandidatesAction(): Promise<
  ActionState<SelectCandidate[]>
> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const candidates = await db.query.candidates.findMany({
      where: eq(candidatesTable.userId, user.id),
      orderBy: [desc(candidatesTable.createdAt)]
    })

    return {
      isSuccess: true,
      message: "Candidates retrieved successfully",
      data: candidates
    }
  } catch (error) {
    console.error("Error getting candidates:", error)
    return { isSuccess: false, message: "Failed to get candidates" }
  }
}

export async function searchCandidatesAction(
  query: string
): Promise<ActionState<SelectCandidate[]>> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const candidates = await db.query.candidates.findMany({
      where: and(
        eq(candidatesTable.userId, user.id),
        or(
          ilike(candidatesTable.name, `%${query}%`),
          ilike(candidatesTable.email, `%${query}%`),
          ilike(candidatesTable.currentCompany, `%${query}%`),
          ilike(candidatesTable.school, `%${query}%`)
        )
      ),
      orderBy: [asc(candidatesTable.name)]
    })

    return {
      isSuccess: true,
      message: "Candidates search successful",
      data: candidates
    }
  } catch (error) {
    console.error("Error searching candidates:", error)
    return { isSuccess: false, message: "Failed to search candidates" }
  }
}

// UPDATE
export async function updateCandidateAction(
  id: string,
  data: Partial<Omit<InsertCandidate, "userId">>
): Promise<ActionState<SelectCandidate>> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Verify the candidate belongs to the user
    const existingCandidate = await db.query.candidates.findFirst({
      where: and(eq(candidatesTable.id, id), eq(candidatesTable.userId, user.id))
    })

    if (!existingCandidate) {
      return { isSuccess: false, message: "Candidate not found" }
    }

    const [updatedCandidate] = await db
      .update(candidatesTable)
      .set(data)
      .where(and(eq(candidatesTable.id, id), eq(candidatesTable.userId, user.id)))
      .returning()

    return {
      isSuccess: true,
      message: "Candidate updated successfully",
      data: updatedCandidate
    }
  } catch (error) {
    console.error("Error updating candidate:", error)
    return { isSuccess: false, message: "Failed to update candidate" }
  }
}

// DELETE
export async function deleteCandidateAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Verify the candidate belongs to the user
    const existingCandidate = await db.query.candidates.findFirst({
      where: and(eq(candidatesTable.id, id), eq(candidatesTable.userId, user.id))
    })

    if (!existingCandidate) {
      return { isSuccess: false, message: "Candidate not found" }
    }

    await db
      .delete(candidatesTable)
      .where(and(eq(candidatesTable.id, id), eq(candidatesTable.userId, user.id)))

    return {
      isSuccess: true,
      message: "Candidate deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting candidate:", error)
    return { isSuccess: false, message: "Failed to delete candidate" }
  }
} 