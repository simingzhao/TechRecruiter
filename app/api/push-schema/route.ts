"use server"

import { NextRequest, NextResponse } from "next/server"
import { pushSchemaAction } from "@/actions/db/push-schema"

export async function GET(request: NextRequest) {
  try {
    // Check for a secret token
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    // Secret token check (in a real app, use a proper secure token)
    if (token !== "push_schema_secret") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Push the schema
    const result = await pushSchemaAction()

    if (result.isSuccess) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in push-schema API route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
