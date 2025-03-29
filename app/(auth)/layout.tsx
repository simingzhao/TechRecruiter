/*
<ai_context>
This server layout provides a centered layout for (auth) pages.
</ai_context>
*/

"use server"

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

export default async function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  // If user is already authenticated, redirect to candidates page
  if (userId) {
    redirect("/candidates")
  }

  return children
}
