# Testing Checklist

Use this checklist to validate all functionality end to end.

## Authentication and Session
- [ ] Student signup succeeds and redirects to dashboard
- [ ] Student login succeeds with valid credentials
- [ ] Login fails with incorrect password
- [ ] Logout clears session and redirects to `/login`
- [ ] Session persists after refresh
- [ ] Suspended student is blocked from protected routes
- [ ] Unauthorized access to student APIs returns 401

## Student Profile
- [ ] Profile data loads correctly
- [ ] Update name, interests, phone, LinkedIn, GitHub, and availability
- [ ] Add skill with valid data
- [ ] Block skill add without name or with invalid level
- [ ] Update skill data
- [ ] Remove skill
- [ ] Add project with required name
- [ ] Update project details
- [ ] Remove project
- [ ] Upload profile picture and see it in profile
- [ ] Remove profile picture
- [ ] Request deletion sets status to DELETION_REQUESTED
- [ ] Cancel deletion returns status to ACTIVE

## Discovery
- [ ] Discovery excludes current student
- [ ] Only semesters 5 to 7 appear
- [ ] Only ACTIVE users appear
- [ ] Default availability filter is AVAILABLE
- [ ] Filter by department returns correct students
- [ ] Filter by semester returns correct students
- [ ] Filter by skills works for multiple skills
- [ ] Pagination returns correct counts
- [ ] Results are sorted by match score desc

## Message Requests
- [ ] Send message request to valid student
- [ ] Prevent message request to self
- [ ] Prevent duplicate pending message request
- [ ] Received request appears in inbox
- [ ] Accept request changes status to ACCEPTED
- [ ] Reject request changes status to REJECTED
- [ ] Accepting request enables messaging between students

## Partner Requests
- [ ] Send partner request only when in same semester
- [ ] Block partner request if sender group locked
- [ ] Block partner request if receiver group locked
- [ ] Block partner request if sender group full
- [ ] Accept partner request joins or creates group
- [ ] Reject partner request updates status
- [ ] Group locks at 3 members

## Messaging
- [ ] Start conversation with permitted student
- [ ] Messages load for a conversation
- [ ] Send message adds optimistic entry immediately
- [ ] Optimistic message is replaced with real server message
- [ ] New message updates conversation preview
- [ ] Unread badge increments for receiver
- [ ] Open chat updates in real time for receiver
- [ ] Messages are marked read when conversation is opened
- [ ] No duplicate messages from realtime events
- [ ] Pagination or limit in get-messages works

## Realtime and Notifications
- [ ] Message insert triggers NotificationBell badge
- [ ] Conversation list updates in real time
- [ ] Unread count updates in real time
- [ ] Message request insert triggers notification
- [ ] Partner request accepted triggers notification
- [ ] Multiple tabs receive realtime updates

## Groups
- [ ] Get my group returns null if none
- [ ] Update group project name and description
- [ ] Lock group only when size is 2 or 3
- [ ] Locked group blocks member removal
- [ ] Remove member works when group is not locked
- [ ] Update group visibility on profile

## Admin
- [ ] Admin signup works
- [ ] Admin login works
- [ ] Admin session endpoint returns current admin
- [ ] Admin logout works
- [ ] Student list loads with pagination
- [ ] Search filters students by name
- [ ] Status filter works for ACTIVE, SUSPENDED, DELETION_REQUESTED
- [ ] Suspend and unsuspend student works
- [ ] Delete student removes from list
- [ ] Conversations list loads
- [ ] Conversation messages list loads with pagination
- [ ] Stats endpoint returns counts

## Security and Access Control
- [ ] Student cannot access admin routes
- [ ] Admin cannot access student-only endpoints
- [ ] Student cannot fetch another student's conversation
- [ ] Only participants can fetch messages for a conversation
- [ ] Requests can only be accepted by receiver

## Error Handling
- [ ] Invalid IDs return helpful errors
- [ ] Network failures show clear message
- [ ] Supabase auth errors are handled cleanly
