"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createCandidateAction } from "@/actions/db/candidates-actions"
import { jobTypeEnum, statusEnum, type InsertCandidate } from "@/db/schema"
import ResumeUpload from "./resume-upload"
import { Loader2 } from "lucide-react"

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  wechat: z.string().optional(),
  linkedinUrl: z.string().optional(),
  googleScholar: z.string().optional(),
  currentCompany: z.string().optional(),
  school: z.string().optional(),
  note: z.string().optional(), // For notes input
  jobType: z.enum(jobTypeEnum.enumValues),
  status: z.enum(statusEnum.enumValues),
  resumeUrl: z.string().optional(),
  resumeFilename: z.string().optional()
})

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      when: "beforeChildren"
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

const tabVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
}

type FormValues = z.infer<typeof formSchema>

export default function AddCandidateForm({
  onSuccess,
  onCancel
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"manual" | "resume">("resume")

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      wechat: "",
      linkedinUrl: "",
      googleScholar: "",
      currentCompany: "",
      school: "",
      note: "",
      jobType: "other",
      status: "new",
      resumeUrl: "",
      resumeFilename: ""
    }
  })

  // Handle resume upload success
  const handleResumeSuccess = (data: any) => {
    const { resumeData, resumeUrl, fileName } = data

    form.reset({
      ...form.getValues(),
      name: resumeData.name || "",
      email: resumeData.email || "",
      phone: resumeData.phone || "",
      wechat: resumeData.wechat || "",
      linkedinUrl: resumeData.linkedinUrl || "",
      googleScholar: resumeData.googleScholar || "",
      currentCompany: resumeData.currentCompany || "",
      school: resumeData.school || "",
      jobType: resumeData.jobType || "other",
      resumeUrl: resumeUrl || "",
      resumeFilename: fileName || ""
    })

    // Set notes with experience summary if available
    if (resumeData.experience && resumeData.experience.length > 0) {
      const recentExperience = resumeData.experience[0]
      let experienceNote = ""

      if (recentExperience.position && recentExperience.company) {
        experienceNote = `Recent experience: ${recentExperience.position} at ${recentExperience.company}`
      } else if (typeof recentExperience === "string") {
        // Handle case where experience might be a string from older format
        experienceNote = `Recent experience: ${recentExperience}`
      }

      if (experienceNote) {
        form.setValue("note", experienceNote)
      }
    }

    // Switch to manual tab to let user review and edit
    setActiveTab("manual")
  }

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)

      // We don't include the note field in candidateData as it's not part of the candidate table
      const candidateData: Omit<InsertCandidate, "userId"> = {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        wechat: values.wechat || null,
        linkedinUrl: values.linkedinUrl || null,
        googleScholar: values.googleScholar || null,
        currentCompany: values.currentCompany || null,
        school: values.school || null,
        jobType: values.jobType,
        status: values.status,
        resumeUrl: values.resumeUrl || null,
        resumeFilename: values.resumeFilename || null
      }

      const result = await createCandidateAction(candidateData)

      if (result.isSuccess) {
        // Create a note if note content was provided
        if (values.note && values.note.trim() !== "") {
          const { createNoteAction } = await import(
            "@/actions/db/notes-actions"
          )
          await createNoteAction({
            candidateId: result.data.id,
            content: values.note
          })
        }

        toast.success("Candidate added successfully")
        onSuccess()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error adding candidate:", error)
      toast.error("Failed to add candidate")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as "manual" | "resume")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resume">Upload Resume</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "resume" && (
            <motion.div
              key="resume-tab"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
            >
              <TabsContent value="resume" className="mt-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Upload a resume to automatically extract candidate
                    information
                  </p>
                  <ResumeUpload
                    onSuccess={handleResumeSuccess}
                    onError={error => toast.error(error)}
                  />
                </div>
              </TabsContent>
            </motion.div>
          )}

          {activeTab === "manual" && (
            <motion.div
              key="manual-tab"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
            >
              <TabsContent value="manual" className="mt-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <motion.div
                      className="grid grid-cols-1 gap-4 md:grid-cols-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="Full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email*</FormLabel>
                              <FormControl>
                                <Input placeholder="Email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="wechat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WeChat</FormLabel>
                              <FormControl>
                                <Input placeholder="WeChat ID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="currentCompany"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Company</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Current company"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="school"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>School/University</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="School or university"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="linkedinUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="LinkedIn profile URL"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="googleScholar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Google Scholar</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Google Scholar URL"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="jobType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Job Type*</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select job type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {jobTypeEnum.enumValues.map(type => (
                                    <SelectItem key={type} value={type}>
                                      {type.charAt(0).toUpperCase() +
                                        type.slice(1).replace(/_/g, " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status*</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {statusEnum.enumValues.map(status => (
                                    <SelectItem key={status} value={status}>
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Additional notes about the candidate"
                                {...field}
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      className="flex justify-end gap-2 pt-2"
                      variants={itemVariants}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Add Candidate
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </TabsContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
