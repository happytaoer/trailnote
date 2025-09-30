# SQL Migration Files

This directory contains all database migration files for the TrailNote project.

## File Naming Convention
- Use format: `YYYY-MM-DD_description.sql`
- Example: `2025-07-31_add_project_dates.sql`

## Migration Guidelines
1. Always include both forward migration and rollback statements
2. Test migrations on development environment first
3. Include comments explaining the purpose of each migration
4. Use transactions where appropriate

## Current Migrations
- `2025-07-31_add_project_dates.sql` - Add start_date and end_date fields to projects table
