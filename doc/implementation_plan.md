# Implementation Plan for Tech Recruiter CRM


## Project Setup and Configuration

- [x] Step 1: Initialize project configuration and environment
    
    - **Task**: Configure environment variables and update project configuration files for the CRM system
    - **Files**:
        - `.env.example`: Add required environment variables
        - `.env.local`: Add local environment variables (this will be for user instructions only)
        - `README.md`: Update with project-specific instructions
    - **User Instructions**:
        - Create a Supabase project and database
        - Create a `resumes` storage bucket in Supabase
        - Add the following to your `.env.local` file:
            
```            
DATABASE_URL=your_supabase_postgres_connection_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_keyOPENAI_API_KEY=your_openai_api_key
```
            
- [x] Step 2: Set up Supabase storage bucket and RLS policies
    
    - **Task**: Create storage configuration for resume files with proper access rules
    - **Files**:
        - `lib/supabase-client.ts`: Create a Supabase client configuration file
    - **User Instructions**:
        - In the Supabase dashboard, create a new storage bucket named "resumes"
        - Set the bucket privacy to "Private"
        - Execute the following SQL in the Supabase SQL Editor to set up RLS policies:
            
            ```sql
            -- Allow users to read their own filesCREATE POLICY "Users can read their own resumes" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);-- Allow users to upload their own filesCREATE POLICY "Users can upload their own resumes" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);-- Allow users to update their own filesCREATE POLICY "Users can update their own resumes" ON storage.objects FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);-- Allow users to delete their own filesCREATE POLICY "Users can delete their own resumes" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
            ```
            

## Database Schema

- [x] Step 3: Create database schemas for candidates and notes
    
    - **Task**: Define the database schema for candidates and notes tables using Drizzle ORM
    - **Files**:
        - `db/schema/candidates-schema.ts`: Create schema for candidates table
        - `db/schema/notes-schema.ts`: Create schema for notes table
        - `db/schema/index.ts`: Update exports for new schemas
        - `db/db.ts`: Update schema object to include new tables
    - **Step Dependencies**: Step 1
- [x] Step 4: Add enums for job types and statuses
    
    - **Task**: Create enum types for job types and candidate statuses
    - **Files**:
        - `db/schema/candidates-schema.ts`: Add enum definitions for job types and statuses
        - `types/candidate-types.ts`: Create type definitions for candidates
        - `types/note-types.ts`: Create type definitions for notes
        - `types/index.ts`: Update type exports
    - **Step Dependencies**: Step 3

## Server Actions

- [x] Step 5: Implement candidate database actions
    
    - **Task**: Create server actions for CRUD operations on candidates
    - **Files**:
        - `actions/db/candidates-actions.ts`: Implement CRUD actions for candidates
    - **Step Dependencies**: Step 3, Step 4
- [x] Step 6: Implement notes database actions
    
    - **Task**: Create server actions for CRUD operations on notes
    - **Files**:
        - `actions/db/notes-actions.ts`: Implement CRUD actions for notes
    - **Step Dependencies**: Step 3, Step 4
- [x] Step 7: Implement resume storage actions
    
    - **Task**: Create server actions for uploading, retrieving, and deleting resume files
    - **Files**:
        - `actions/storage/resume-storage-actions.ts`: Implement storage actions for resumes
    - **Step Dependencies**: Step 2
- [x] Step 8: Implement resume parsing utility
    
    - **Task**: Create utility functions to parse resume content using pdf2json
    - **Files**:
        - `lib/utils/resume-parser.ts`: Implement basic PDF parsing functionality
    - **Step Dependencies**: Step 1
- [x] Step 9: Implement OpenAI integration for resume data extraction
    
    - **Task**: Create utility to extract structured data from resume text using OpenAI
    - **Files**:
        - `lib/utils/extract-resume-data.ts`: Implement resume data extraction with OpenAI
        - `prompts/resume-extraction-prompt.ts`: Create prompt template for OpenAI
    - **Step Dependencies**: Step 8
- [x] Step 10: Implement resume parsing action
    
    - **Task**: Create server action that combines file storage, parsing, and data extraction
    - **Files**:
        - `actions/resume-actions.ts`: Implement complete resume parsing action
    - **Step Dependencies**: Step 7, Step 8, Step 9
- [x] Step 11: Implement export to Excel functionality
    
    - **Task**: Create server action to export candidate data to Excel format
    - **Files**:
        - `actions/export-actions.ts`: Implement Excel export functionality
        - `app/api/export/route.ts`: Create API route for file downloads
    - **Step Dependencies**: Step 5
    - **User Instructions**: Install additional package for Excel export
        
        ```bash
        npm install xlsx
        ```
        

## Shared Components

- [x] Step 12: Create candidate tag component
    
    - **Task**: Implement a reusable component for displaying job types and statuses as colored tags
    - **Files**:
        - `components/candidate-tag.tsx`: Create tag component with color variants
    - **Step Dependencies**: Step 4
- [x] Step 13: Create resume preview component
    
    - **Task**: Implement a component for previewing resume files
    - **Files**:
        - `components/resume-preview.tsx`: Create resume preview component
    - **Step Dependencies**: Step 7
- [x] Step 14: Create status badge component
    
    - **Task**: Implement a reusable component for displaying candidate status
    - **Files**:
        - `components/status-badge.tsx`: Create status badge component
    - **Step Dependencies**: Step 4

## Dashboard Page

- [x] Step 15: Create dashboard layout
    
    - **Task**: Implement the layout for the dashboard section
    - **Files**:
        - `app/(dashboard)/layout.tsx`: Create dashboard layout with auth protection
    - **Step Dependencies**: Step 3
- [x] Step 16: Implement candidate table skeleton
    
    - **Task**: Create placeholder for candidate table during loading
    - **Files**:
        - `app/(dashboard)/_components/candidate-table-skeleton.tsx`: Create skeleton loader
    - **Step Dependencies**: Step 15
- [x] Step 17: Implement candidate table server component
    
    - **Task**: Create server component for fetching and displaying candidate data
    - **Files**:
        - `app/(dashboard)/_components/candidate-table-fetcher.tsx`: Create server component to fetch candidate data
    - **Step Dependencies**: Step 5, Step 16
- [x] Step 18: Implement candidate table client component
    
    - **Task**: Create interactive client component for candidate table with selection and actions
    - **Files**:
        - `app/(dashboard)/_components/candidate-table.tsx`: Create interactive table component
    - **Step Dependencies**: Step 12, Step 14, Step 17
- [x] Step 19: Implement search and filter bar
    
    - **Task**: Create search and filter functionality for candidate table
    - **Files**:
        - `app/(dashboard)/_components/search-filter-bar.tsx`: Create search and filter component
    - **Step Dependencies**: Step 4, Step 15
- [x] Step 20: Implement dashboard page
    
    - **Task**: Assemble dashboard page with search, filter, and table components
    - **Files**:
        - `app/(dashboard)/page.tsx`: Implement main dashboard page
    - **Step Dependencies**: Step 17, Step 18, Step 19

## Candidate Management

- [x] Step 21: Implement add candidate button
    
    - **Task**: Create button that opens the add candidate modal
    - **Files**:
        - `app/(dashboard)/_components/add-candidate-button.tsx`: Create button component
    - **Step Dependencies**: Step 15
- [x] Step 22: Implement resume upload component
    
    - **Task**: Create component for uploading and parsing resumes
    - **Files**:
        - `app/(dashboard)/_components/resume-upload.tsx`: Create resume upload component with drag-and-drop
    - **Step Dependencies**: Step 7, Step 10
- [x] Step 23: Implement add candidate form
    
    - **Task**: Create form for adding new candidates with resume parsing
    - **Files**:
        - `app/(dashboard)/_components/add-candidate-form.tsx`: Create form component with resume upload
    - **Step Dependencies**: Step 5, Step 10, Step 21, Step 22
    - **User Instructions**: Install additional packages for form handling
        
        ```bash
        npm install react-hook-form @hookform/resolvers zod
        ```
        

## Candidate Detail Page

- [x] Step 24: Implement candidate detail page structure
    
    - **Task**: Create basic structure for candidate detail page
    - **Files**:
        - `app/(dashboard)/candidates/[id]/page.tsx`: Create candidate detail page
    - **Step Dependencies**: Step 5, Step 15
- [x] Step 25: Implement candidate header component
    
    - **Task**: Create component displaying candidate info and actions
    - **Files**:
        - `app/(dashboard)/candidates/[id]/_components/candidate-header.tsx`: Create header component
    - **Step Dependencies**: Step 12, Step 13, Step 14, Step 24
- [x] Step 26: Implement notes timeline component
    
    - **Task**: Create component displaying chronological notes for a candidate
    - **Files**:
        - `app/(dashboard)/candidates/[id]/_components/notes-timeline.tsx`: Create notes timeline
    - **Step Dependencies**: Step 6, Step 24
- [x] Step 27: Implement note form component
    
    - **Task**: Create form for adding new notes to a candidate
    - **Files**:
        - `app/(dashboard)/candidates/[id]/_components/note-form.tsx`: Create note form component
    - **Step Dependencies**: Step 6, Step 24
- [x] Step 28: Complete candidate detail page
    
    - **Task**: Assemble complete candidate detail page with header, notes, and forms
    - **Files**:
        - `app/(dashboard)/candidates/[id]/page.tsx`: Update page with all components
    - **Step Dependencies**: Step 25, Step 26, Step 27

## Routing and Navigation

- [x] Step 29: Implement candidates listing page
    
    - **Task**: Create page that shows all candidates with pagination
    - **Files**:
        - `app/(dashboard)/candidates/page.tsx`: Create candidates listing page
    - **Step Dependencies**: Step 17, Step 18, Step 19, Step 20
- [x] Step 30: Set up root layout and redirects
    
    - **Task**: Configure root layout and authentication redirects
    - **Files**:
        - `app/page.tsx`: Update root page with proper redirects
        - `middleware.ts`: Update middleware for authentication
    - **Step Dependencies**: Step 15, Step 20

## Export Functionality

- [x] Step 31: Implement export UI component
    - **Task**: Create UI for exporting candidate data to Excel
    - **Files**:
        - `app/(dashboard)/_components/export-button.tsx`: Create export button component
    - **Step Dependencies**: Step 11, Step 18, Step 20

## Animations and Polish

- [ ] Step 32: Add Framer Motion animations
    
    - **Task**: Add animations to key UI elements for a polished experience
    - **Files**:
        - `app/(dashboard)/_components/add-candidate-form.tsx`: Add animations to form
        - `app/(dashboard)/_components/candidate-table.tsx`: Add animations to table
        - `app/(dashboard)/candidates/[id]/_components/notes-timeline.tsx`: Add animations to notes
    - **Step Dependencies**: Step 23, Step 18, Step 26
- [ ] Step 33: Implement responsive design adjustments
    
    - **Task**: Ensure the application is fully responsive across device sizes
    - **Files**:
        - `app/(dashboard)/_components/candidate-table.tsx`: Add responsive behavior
        - `app/(dashboard)/_components/search-filter-bar.tsx`: Add responsive behavior
        - `app/(dashboard)/candidates/[id]/_components/candidate-header.tsx`: Add responsive behavior
    - **Step Dependencies**: Step 18, Step 19, Step 25

Each step builds upon previous ones, ensuring that dependencies are properly managed. The plan is designed to be implemented sequentially, with each step focusing on a specific aspect of the application that can be completed in a single iteration.