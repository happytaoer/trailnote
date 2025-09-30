# Database Migration Summary

## 2025-07-31: Add Feedback Table

### Database Changes
- **Migration File**: `2025-07-31_add_feedback_table.sql`
- **Applied**: ✅ Successfully applied to database

### New Table: `feedback`
- **Purpose**: Store user feedback, suggestions, and bug reports
- **Fields**:
  - `id` (UUID, primary key, auto-generated)
  - `user_id` (UUID, foreign key to auth.users)
  - `content` (TEXT, required) - The feedback content
  - `type` (VARCHAR(50), default 'suggestion') - Type of feedback: suggestion, bug, feature, other
  - `status` (VARCHAR(50), default 'pending') - Status: pending, reviewed, resolved, dismissed
  - `created_at` (timestamp with time zone, auto-generated)
  - `updated_at` (timestamp with time zone, auto-updated)

### Security Features:
- **RLS (Row Level Security)** enabled
- Users can only insert their own feedback
- Users can only view their own feedback
- Indexes added for performance (user_id, created_at, status)
- Auto-update trigger for updated_at field

### Code Components Added:
1. **Feedback.tsx** - Modal component for submitting feedback
2. **feedback-api.ts** - API functions for feedback operations
3. **feedback.ts** - TypeScript types for feedback data
4. **UserSection.tsx** - Updated with feedback button

---

## 2025-07-31: Add Project Date Fields

### Database Changes
- **Migration File**: `2025-07-31_add_project_dates.sql`
- **Applied**: ✅ Successfully applied to database

### Fields Added to `projects` table:
1. `start_date` (timestamp with time zone, nullable)
   - Purpose: Record project start date and time
   - Comment: 'Project start date and time'

2. `end_date` (timestamp with time zone, nullable)
   - Purpose: Record project end date and time  
   - Comment: 'Project end date and time'

### Constraints Added:
- `check_project_dates`: Ensures end_date >= start_date when both are set
- Both fields are nullable to allow flexible project planning

### Code Changes

#### 1. TypeScript Types (`types/index.ts`)
- Added `start_date?: string` to Project interface
- Added `end_date?: string` to Project interface

#### 2. CreateProjectModal Component
- Added DatePicker import from antd
- Added dayjs import for date handling
- Added startDate and endDate state variables (Dayjs | null)
- Updated onConfirm interface to accept startDate and endDate parameters
- Added date conversion logic (Dayjs to ISO string)
- Added date picker UI components with validation:
  - Start date cannot be after end date
  - End date cannot be before start date
- Updated form reset logic to clear date fields

#### 3. EditProjectModal Component  
- Added DatePicker import from antd
- Added dayjs import for date handling
- Added startDate and endDate state variables (Dayjs | null)
- Updated onConfirm interface to accept startDate and endDate parameters
- Added date initialization from existing project data
- Added date conversion logic (Dayjs to ISO string)
- Added date picker UI components with validation
- Updated all onConfirm calls to pass date parameters

### UI Features
- Date pickers with cross-validation (start <= end)
- Optional date fields (can be left empty)
- Proper date formatting and conversion
- Consistent styling with existing form elements

### Next Steps Required
- Update API endpoints to handle start_date and end_date parameters
- Update project creation and update functions in the backend
- Test the complete flow from UI to database

### Rollback Instructions
If rollback is needed, uncomment the rollback section in `2025-07-31_add_project_dates.sql`:
```sql
-- Remove the constraint
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS check_project_dates;

-- Remove the columns  
ALTER TABLE public.projects DROP COLUMN IF EXISTS end_date;
ALTER TABLE public.projects DROP COLUMN IF EXISTS start_date;
```
