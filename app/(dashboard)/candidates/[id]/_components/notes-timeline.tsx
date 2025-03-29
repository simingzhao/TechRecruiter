"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarDays,
  Loader2,
  MessageSquare,
  Pencil,
  Save,
  Trash2,
  X
} from "lucide-react"

import { updateNoteAction, deleteNoteAction } from "@/actions/db/notes-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { SelectNote } from "@/db/schema"

interface NotesTimelineProps {
  notes: SelectNote[]
}

export default function NotesTimeline({ notes }: NotesTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // Mount handling remains the same...
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Scroll handling remains the same...
  useEffect(() => {
    if (!editingNoteId && scrollRef.current && notes.length > 0) {
      // Only scroll if not editing
      const scrollContainer = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 100)
      }
    }
  }, [notes.length, editingNoteId])

  // Start editing a note
  const handleEditStart = (note: SelectNote) => {
    setEditingNoteId(note.id)
    setEditedContent(note.content)
  }

  // Cancel editing
  const handleEditCancel = () => {
    setEditingNoteId(null)
    setEditedContent("")
  }

  // Save edited note
  const handleUpdateNote = async () => {
    if (!editingNoteId || editedContent.trim() === "") return

    setIsUpdating(true)
    try {
      const result = await updateNoteAction(editingNoteId, editedContent)
      if (result.isSuccess) {
        toast.success("Note updated successfully")
        setEditingNoteId(null)
        setEditedContent("")
        router.refresh() // Refresh page data
      } else {
        toast.error(result.message || "Failed to update note")
      }
    } catch (error) {
      toast.error("An error occurred while updating the note.")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete a note
  const handleDeleteNote = async (noteId: string) => {
    setIsDeleting(true)
    setDeletingNoteId(noteId) // Track which note is being deleted for UI feedback
    try {
      const result = await deleteNoteAction(noteId)
      if (result.isSuccess) {
        toast.success("Note deleted successfully")
        router.refresh() // Refresh page data
      } else {
        toast.error(result.message || "Failed to delete note")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the note.")
      console.error(error)
    } finally {
      setIsDeleting(false)
      setDeletingNoteId(null) // Reset deleting state
    }
  }

  if (!isMounted) {
    // Skeleton rendering remains the same...
    return (
      <div className="bg-muted/50 h-[400px] animate-pulse rounded-lg"></div>
    )
  }

  if (notes.length === 0) {
    // Empty state rendering remains the same...
    return (
      <motion.div
        className="text-muted-foreground rounded-lg border p-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p>No notes yet. Add your first note to keep track of interactions.</p>
      </motion.div>
    )
  }

  // Animation variants remain the same...
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, x: -20, scale: 0.98 },
    show: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  }

  // Grouping and sorting logic remains the same...
  const groupedNotes = notes.reduce(
    (groups, note) => {
      // ... grouping logic ...
      if (!note.createdAt) return groups
      const date = new Date(note.createdAt)
      const dateKey = format(date, "yyyy-MM-dd")
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: format(date, "MMMM d, yyyy"),
          notes: []
        }
      }
      groups[dateKey].notes.push(note)
      return groups
    },
    {} as Record<string, { date: string; notes: SelectNote[] }>
  )

  const sortedDates = Object.keys(groupedNotes).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  // Update the timeline height for better display
  const timelineHeight = `max-h-[600px] min-h-[300px]`

  return (
    // Main structure remains the same...
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Notes & Activity</h2>
      <ScrollArea className={`${timelineHeight} -mr-4 pr-4`} ref={scrollRef}>
        <motion.div
          className="border-border/50 relative border-l-2 pl-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {sortedDates.map((dateKey, dateIndex) => (
              <motion.div
                key={dateKey}
                className="mb-8 last:mb-0"
                variants={item}
              >
                {/* Date Marker remains the same */}
                <div className="absolute -left-[11px] mt-1.5 flex items-center">
                  <div className="bg-primary ring-background z-10 flex size-5 items-center justify-center rounded-full ring-4">
                    <CalendarDays className="text-primary-foreground size-3" />
                  </div>
                </div>
                <div className="mb-3 ml-6">
                  <p className="text-primary text-sm font-semibold">
                    {groupedNotes[dateKey].date}
                  </p>
                </div>

                {/* Notes for this date */}
                <div className="ml-6 space-y-4">
                  {groupedNotes[dateKey].notes.map(note => (
                    <motion.div
                      key={note.id}
                      className="before:bg-border/50 relative pl-6 before:absolute before:left-[-27px] before:top-[14px] before:h-px before:w-6"
                      variants={item}
                    >
                      {/* Small dot remains the same */}
                      <div className="bg-muted-foreground/50 ring-background absolute -left-[31px] mt-[13px] size-2 rounded-full ring-2"></div>

                      {/* Note Content - Conditionally render edit form or display */}
                      <div className="bg-card rounded-lg border p-3 shadow-sm transition-shadow duration-200 hover:shadow-md">
                        {editingNoteId === note.id ? (
                          // Edit Mode
                          <div className="space-y-2">
                            <Textarea
                              value={editedContent}
                              onChange={e => setEditedContent(e.target.value)}
                              className="min-h-[80px] text-sm"
                              disabled={isUpdating}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleEditCancel}
                                disabled={isUpdating}
                              >
                                <X className="mr-1 size-4" /> Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleUpdateNote}
                                disabled={
                                  isUpdating || editedContent.trim() === ""
                                }
                              >
                                {isUpdating ? (
                                  <Loader2 className="mr-1 size-4 animate-spin" />
                                ) : (
                                  <Save className="mr-1 size-4" />
                                )}
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Display Mode
                          <>
                            <div className="mb-1.5 flex items-center justify-between">
                              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                <MessageSquare className="size-3" />
                                <span>
                                  {note.createdAt
                                    ? format(new Date(note.createdAt), "h:mm a")
                                    : "Time unknown"}
                                  {note.updatedAt &&
                                    note.updatedAt > note.createdAt! && (
                                      <span
                                        title={`Edited: ${format(new Date(note.updatedAt), "PPp")}`}
                                      >
                                        {" "}
                                        (edited)
                                      </span>
                                    )}
                                </span>
                              </div>
                              {/* Edit and Delete Buttons */}
                              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6"
                                  onClick={() => handleEditStart(note)}
                                >
                                  <Pencil className="size-3.5" />
                                  <span className="sr-only">Edit Note</span>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:text-destructive size-6"
                                      disabled={
                                        isDeleting && deletingNoteId === note.id
                                      }
                                    >
                                      {isDeleting &&
                                      deletingNoteId === note.id ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="size-3.5" />
                                      )}
                                      <span className="sr-only">
                                        Delete Note
                                      </span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Note?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. Are you
                                        sure you want to permanently delete this
                                        note?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteNote(note.id)
                                        }
                                        className="bg-destructive hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">
                              {note.content}
                            </p>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </ScrollArea>
    </div>
  )
}
