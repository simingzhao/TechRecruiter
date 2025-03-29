"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

export default async function RootPage() {
  const { userId } = await auth()

  // If user is authenticated, redirect to dashboard
  if (userId) {
    redirect("/candidates")
  }

  // Otherwise, redirect to sign-in
  redirect("/sign-in")
}
