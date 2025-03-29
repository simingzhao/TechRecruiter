"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function PushSchemaPage() {
  const [isPushing, setIsPushing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const pushSchema = async () => {
    try {
      setIsPushing(true)
      setResult(null)

      const response = await fetch("/api/push-schema?token=push_schema_secret")
      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Schema pushed successfully"
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to push schema"
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setIsPushing(false)
    }
  }

  return (
    <div className="container max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>Push Database Schema</CardTitle>
          <CardDescription>
            Create database tables and enums in Supabase based on the app's
            schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            This tool is for development purposes only. It will create the
            necessary tables and enums in your Supabase database. Use this when
            you first set up the app or when you make schema changes.
          </p>

          {result && (
            <Alert
              variant={result.success ? "default" : "destructive"}
              className="my-4"
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <XCircle className="size-4" />
                )}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {result.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={pushSchema}
            disabled={isPushing}
            className="flex items-center gap-2"
          >
            {isPushing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Pushing Schema...
              </>
            ) : (
              <>
                Push Schema
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
