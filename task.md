# Course Join Request Feature Implementation

## 📋 Database Schema Changes
- [ ] Add `CourseJoinRequest` model to Prisma schema
- [ ] Add `RequestStatus` enum (PENDING, APPROVED, REJECTED)
- [ ] Add relation fields to User and Course models
- [ ] Run database migration
- [ ] Update TypeScript types

## 🔧 Backend Implementation
- [ ] Create `app/actions/join-request-actions.ts`
  - [ ] `requestJoinCourse(courseId, message?)` - Submit join request
  - [ ] `approveJoinRequest(requestId)` - Approve and add user to course
  - [ ] `rejectJoinRequest(requestId, reason?)` - Reject request
  - [ ] `getJoinRequests(courseId)` - Get requests for course author
  - [ ] `getUserJoinRequestStatus(courseId, userId)` - Check user's request status
  - [ ] `cancelJoinRequest(requestId)` - Allow user to cancel pending request

## 🎨 Frontend Components
- [ ] Create `components/courses/request-join-modal.tsx`
  - [ ] Form with optional message input
  - [ ] Submit and cancel actions
  - [ ] Loading states
- [ ] Create `components/courses/join-request-card.tsx`
  - [ ] Display requester info and message
  - [ ] Approve/Reject buttons
  - [ ] Status badges
- [ ] Create `components/courses/request-status-badge.tsx`
  - [ ] Show PENDING/APPROVED/REJECTED status
  - [ ] Color-coded badges
- [ ] Update `components/courses/course-header.tsx`
  - [ ] Replace join button with request button
  - [ ] Show request status if user has pending/rejected request
  - [ ] Handle different states (can request, pending, rejected, approved)

## 📱 Pages & UI Updates
- [ ] Create `app/dashboard/course-requests/page.tsx`
  - [ ] List all join requests for author's courses
  - [ ] Filter by status (pending, approved, rejected)
  - [ ] Bulk actions support
- [ ] Update course page to show request status
- [ ] Add request management section to course edit page
- [ ] Update navigation to include course requests link for authors

## 🔔 Notification System
- [ ] Add push notification for new join requests
- [ ] Add email notification option
- [ ] Notify students when request is approved/rejected
- [ ] Add notification preferences

## 🎯 Additional Features
- [ ] Add course setting: "Require approval to join" (toggle)
- [ ] Add request expiration (auto-reject after X days)
- [ ] Add bulk approve/reject functionality
- [ ] Add request history for students
- [ ] Add analytics: request approval rates

## 🧪 Testing & Validation
- [ ] Test request submission flow
- [ ] Test approval/rejection flow
- [ ] Test notification delivery
- [ ] Test edge cases (duplicate requests, deleted courses, etc.)
- [ ] Test UI responsiveness on mobile
- [ ] Add form validation and error handling

## 📝 Documentation
- [ ] Update API documentation
- [ ] Add user guide for course authors
- [ ] Add user guide for students
