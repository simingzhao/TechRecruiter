# Tech Recruiter CRM

A CRM system designed specifically for tech recruiters to manage candidate profiles, parse resumes, track candidate status, and maintain communication logs.

## Tech Stack

- Frontend: Next.js, Tailwind CSS, Shadcn, Framer Motion
- Backend: Postgres, Supabase, Drizzle ORM, Server Actions
- Auth: Clerk
- Deployment: Vercel

## Features

- Candidate profile management
- Resume parsing with OpenAI integration
- Candidate status tracking
- Communication logs
- Excel export functionality
- Responsive design with animations

## Prerequisites

You will need accounts for the following services:

- [Supabase](https://supabase.com/) for database and storage
- [Clerk](https://clerk.com/) for authentication
- [OpenAI](https://openai.com/) for resume parsing
- [Vercel](https://vercel.com/) for deployment (optional)

## Setup Instructions

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your environment variables:

```bash
# Database
DATABASE_URL=your_supabase_postgres_connection_string

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

3. Set up Supabase storage:
   - Create a new storage bucket named "resumes" in your Supabase project
   - Set the bucket privacy to "Private"
   - Set up Row Level Security (RLS) policies for the bucket (see below)

4. Run `npm install` to install dependencies
5. Run `npm run dev` to start the development server

## Supabase Setup

### Storage Bucket RLS Policies

Execute the following SQL in the Supabase SQL Editor to set up proper RLS policies for the resumes storage bucket:

```sql
-- Allow users to read their own files
CREATE POLICY "Users can read their own resumes" 
ON storage.objects 
FOR SELECT 
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to upload their own files
CREATE POLICY "Users can upload their own resumes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own files
CREATE POLICY "Users can update their own resumes" 
ON storage.objects 
FOR UPDATE 
USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own resumes" 
ON storage.objects 
FOR DELETE 
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## Development

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
