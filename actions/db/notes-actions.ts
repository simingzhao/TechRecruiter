"use server"

import { db } from "@/db/db"
import { notesTable, type InsertNote, type SelectNote } from "@/db/schema"
import { ActionState } from "@/types"
import { currentUser } from "@clerk/nextjs/server"
import { eq, and, desc } from "drizzle-orm"

// CREATE
export async function createNoteAction(
  note: Omit<InsertNote, "userId">
): Promise<ActionState<SelectNote>> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const [newNote] = await db
      .insert(notesTable)
      .values({ ...note, userId: user.id })
      .returning()

    return {
      isSuccess: true,
      message: "Note created successfully",
      data: newNote
    }
  } catch (error) {
    console.error("Error creating note:", error)
    return { isSuccess: false, message: "Failed to create note" }
  }
}

// READ
export async function getNotesByCandidateIdAction(
  candidateId: string
): Promise<ActionState<SelectNote[]>> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const notes = await db.query.notes.findMany({
      where: and(
        eq(notesTable.userId, user.id),
        eq(notesTable.candidateId, candidateId)
      ),
      orderBy: [desc(notesTable.createdAt)]
    })

    return {
      isSuccess: true,
      message: "Notes retrieved successfully",
      data: notes
    }
  } catch (error) {
    console.error("Error retrieving notes:", error)
    return { isSuccess: false, message: "Failed to retrieve notes" }
  }
}

// Alias to maintain backward compatibility with existing code
export const getNotesByCandiateIdAction = getNotesByCandidateIdAction;

// UPDATE
export async function updateNoteAction(
  id: string,
  content: string
): Promise<ActionState<SelectNote>> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    const [updatedNote] = await db
      .update(notesTable)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, user.id)))
      .returning()

    if (!updatedNote) {
      return { isSuccess: false, message: "Note not found or not authorized" }
    }

    return {
      isSuccess: true,
      message: "Note updated successfully",
      data: updatedNote
    }
  } catch (error) {
    console.error("Error updating note:", error)
    return { isSuccess: false, message: "Failed to update note" }
  }
}

// DELETE
export async function deleteNoteAction(
  id: string
): Promise<ActionState<void>> {
  try {
    const user = await currentUser()

    if (!user) {
      return { isSuccess: false, message: "Unauthorized" }
    }

    await db
      .delete(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, user.id)))

    return {
      isSuccess: true,
      message: "Note deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting note:", error)
    return { isSuccess: false, message: "Failed to delete note" }
  }
} 