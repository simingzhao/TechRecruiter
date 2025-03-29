import { clerkMiddleware } from "@clerk/nextjs/server"

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware()

// Stop Middleware running on static files and public folder
export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}