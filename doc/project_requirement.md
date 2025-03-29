# Tech Recruiter CRM MVP

## Project Description
A CRM system designed specifically for tech recruiters to manage candidate profiles, parse resumes, track candidate status, and maintain communication logs.

## Target Audience
Tech recruiters

## Desired Features
### Candidate Management
- [ ] Add candidate functionality
    - [ ] Pop-up form with resume upload region and input fields
    - [ ] Input fields: Name, Phone Number, Email Address, WeChat, Job Type (tag), Current Company, School, LinkedIn URL, Google Scholar, Status (tag)
    - [ ] Resume parsing with progress bar
    - [ ] Auto-fill form fields from parsed resume
    - [ ] Manual input option
### Dashboard
- [ ] Candidate pool table with key information
    - [ ] Columns: Name, Job Type (colored tag), Current Company, School, Status (colored tag), Actions (View Detail, Delete)
- [ ] Search functionality
- [ ] Filter bar (Name, Job Type, Current Company, School, Status)
- [ ] Selection options (individual, select all, filter-based)
- [ ] Export to Excel functionality
### Candidate Detail Page
- [ ] Header region with candidate information
    - [ ] Resume preview capability
    - [ ] Edit information option
- [ ] Chronological note-taking region

## Design Requests
- [ ] User-friendly interface with responsive design
    - [ ] Colored tags for Job Type and Status
    - [ ] Pop-up forms
    - [ ] Animations using Framer Motion

## Technology Stack
- [ ] Frontend: Next.js, Tailwind CSS, Shadcn, Framer Motion
- [ ] Backend: Postgres, Supabase, Drizzle ORM, Server Actions
- [ ] Authentication: Clerk
- [ ] Payments: Stripe
- [ ] Deployment: Vercel

## Other Notes
- This is an MVP (Minimum Viable Product)
- Mobile app may be considered in the future