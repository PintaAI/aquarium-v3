# Course Type System Implementation - Event Courses

## Database Schema Changes
- [x] Add `CourseType` enum (NORMAL, EVENT) to Prisma schema
- [x] Add `type` field to Course model with default NORMAL
- [x] Add `eventStartDate` and `eventEndDate` fields to Course model
- [x] Run database migration

## Backend Logic Updates
- [x] Update course creation schema validation to include type and event dates
- [x] Update `addCourse` action to handle event course data
- [x] Update `updateCourse` action to handle event course data
- [x] Create utility functions for event course status checking
- [x] Implement automatic course locking logic for expired events
- [x] Implement automatic member clearing for expired events
- [x] Update course fetching logic to include event status

## Frontend UI Updates
- [x] Update course creation form to include course type selector
- [x] Add date pickers for event start/end dates (conditional rendering)
- [x] Update course cards to show event badges and status
- [x] Update course header to display event information
- [x] Add event status indicators (Coming Soon, Active, Expired)
- [x] Update course validation schemas on frontend

## Course Access Logic
- [x] Update course access checking to consider event periods
- [x] Modify join request system to work with event courses (prevent approval for expired events)
- [x] Update course locking logic based on event status (integrated into UI and backend)
- [x] Handle edge cases (timezone considerations, etc. - reviewed and covered by Date objects and utility functions)

## Cleanup & Maintenance
- [x] Create scheduled job/script to cleanup expired event courses
- [ ] Add logging for event course status changes
- [ ] Update existing course data migration (set type to NORMAL)

## Testing & Validation
- [ ] Test event course creation and management
- [ ] Test course access during different event phases
- [ ] Test member cleanup after event expiration
- [ ] Test join request functionality with event courses
- [ ] Test edge cases and error handling

## Documentation
- [ ] Update API documentation for new fields
- [ ] Document event course behavior
- [ ] Add usage examples for teachers
