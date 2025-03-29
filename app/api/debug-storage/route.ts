import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get the path parameter
  const url = new URL(req.url)
  const path = url.searchParams.get("path")
  const bucket = url.searchParams.get("bucket") || "resumes"

  try {
    // List all files in the bucket
    const { data: bucketData, error: bucketError } =
      await supabase.storage.getBucket(bucket)

    if (bucketError) {
      return NextResponse.json(
        { error: `Error getting bucket: ${bucketError.message}` },
        { status: 500 }
      )
    }

    // If path is provided, try to list files in that path
    let filesInPath = null
    if (path) {
      const parentFolder = path.split("/").slice(0, -1).join("/")
      const { data: pathData, error: pathError } = await supabase.storage
        .from(bucket)
        .list(parentFolder)

      if (pathError) {
        return NextResponse.json(
          { error: `Error listing path: ${pathError.message}` },
          { status: 500 }
        )
      }

      filesInPath = pathData
    }

    // Get all files in the user's folder
    const { data: userFiles, error: userError } = await supabase.storage
      .from(bucket)
      .list(userId.replace(/[^a-zA-Z0-9-]/g, "-"))

    if (userError) {
      return NextResponse.json(
        { error: `Error listing user files: ${userError.message}` },
        { status: 500 }
      )
    }

    // List all folders in the bucket (including user folders)
    const { data: folders, error: foldersError } = await supabase.storage
      .from(bucket)
      .list("")

    if (foldersError) {
      return NextResponse.json(
        { error: `Error listing folders: ${foldersError.message}` },
        { status: 500 }
      )
    }

    // If path is provided, try to get signed URL
    let signedUrl = null
    if (path) {
      try {
        const { data: urlData, error: urlError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 60) // 1 minute expiry

        if (urlError) {
          signedUrl = { error: urlError.message }
        } else {
          signedUrl = urlData
        }
      } catch (e: any) {
        signedUrl = { error: e.message }
      }
    }

    return NextResponse.json({
      bucket: bucketData,
      path: path,
      filesInPath: filesInPath,
      userFiles: userFiles,
      folders: folders,
      signedUrl: signedUrl,
      userId: userId,
      formattedUserId: userId.replace(/[^a-zA-Z0-9-]/g, "-")
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}
