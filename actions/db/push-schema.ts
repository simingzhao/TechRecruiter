"use server"

import { db } from "@/db/db"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import { sql } from "drizzle-orm"
import { ActionState } from "@/types"

/**
 * Push the database schema to Supabase
 * This is used for development and should not be used in production
 */
export async function pushSchemaAction(): Promise<ActionState<void>> {
  try {
    console.log("Pushing schema to database...")

    // Create enums
    await db.execute(sql`
      DO $$ 
      BEGIN
        -- Create job_type enum if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
          CREATE TYPE job_type AS ENUM (
            'software_engineer',
            'data_scientist',
            'product_manager',
            'designer',
            'devops',
            'qa_engineer',
            'frontend_developer',
            'backend_developer',
            'fullstack_developer',
            'mobile_developer',
            'ml_engineer',
            'other'
          );
        END IF;

        -- Create status enum if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
          CREATE TYPE status AS ENUM (
            'new',
            'contacted',
            'interviewing',
            'offered',
            'hired',
            'rejected',
            'on_hold',
            'not_interested'
          );
        END IF;

        -- Create membership enum if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership') THEN
          CREATE TYPE membership AS ENUM ('free', 'pro');
        END IF;
      END $$;
    `);

    // Create candidates table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        wechat TEXT,
        job_type job_type NOT NULL,
        current_company TEXT,
        school TEXT,
        linkedin_url TEXT,
        google_scholar TEXT,
        status status NOT NULL DEFAULT 'new',
        resume_url TEXT,
        resume_filename TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create notes table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create profiles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS profiles (
        user_id TEXT PRIMARY KEY NOT NULL,
        membership membership NOT NULL DEFAULT 'free',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create todos table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Schema pushed successfully!")
    return {
      isSuccess: true,
      message: "Schema pushed successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error pushing schema:", error)
    return {
      isSuccess: false,
      message: `Failed to push schema: ${error instanceof Error ? error.message : String(error)}`
    }
  }
} 