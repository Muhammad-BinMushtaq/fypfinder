# Security Audit — FYP Finder

## 1. Summary
FYP Finder applies several important security controls, including role-based access, student email domain validation, and rate limiting. This audit highlights what is currently strong and where additional verification is recommended.

## 2. Strengths
- **Role enforcement**: `lib/auth.ts` and API routes use role checks for protected student and admin behavior.
- **Domain restriction**: student OAuth signup is limited to allowed PAF-IAST domains.
- **Account status handling**: suspended users are blocked from access.
- **Rate limiting**: auth-related endpoints have request throttling in `lib/rate-limit.ts`.
- **Session cleanup**: unauthorized OAuth users may be deleted and redirected on failure.

## 3. Security Observations
### 3.1 Auth and Sessions
- `app/api/auth/callback/route.ts` is the critical onboarding flow and already contains strong validation logic.
- Admin login and signup are separated under `app/api/admin/`.
- The system stores Supabase session state and uses it to map to Prisma user records.

### 3.2 Input Validation
- Many route handlers perform type and presence checks.
- Recommendation: standardize validation with a library such as Zod or use shared validators to reduce ad hoc checks.

### 3.3 Realtime and Push
- Realtime security depends on Supabase RLS policies, which are not visible in the repository.
- Push subscriptions store endpoint and key material; ensure these values are protected and not leaked.

### 3.4 Data Exposure
- Public profile endpoints may reveal student information; ensure only intended fields are returned.
- Admin conversation views must be restricted to active admin sessions.

## 4. Risks and Recommendations
### 4.1 Supabase RLS and Realtime
- **Verify RLS** for `Message`, `Request`, and `Conversation` tables.
- Ensure only authorized participants receive realtime updates.

### 4.2 Admin Signup and Session
- Protect `/api/admin/signup` behind existing admin auth to prevent privilege escalation.
- Validate admin session token expiration and logout behavior.

### 4.3 OAuth Domain Rules
- Maintain the allowed domain list and registration validation logic as university policies change.
- Consider externalizing domain rules to configuration rather than hardcoding if the scope expands.

### 4.4 Rate Limiting Coverage
- Extend rate limiting beyond auth endpoints to critical mutation routes if abuse risk increases.

### 4.5 Secrets and Environment Variables
- Ensure `SECRET_SUPABASE_SERVICE_ROLE_KEY` and other secret env vars are only available server-side.
- Avoid exposing service role or admin keys in client bundles.

## 5. Recommendations
- Maintain a documented Supabase security configuration in the repo.
- Add schema-based validation for all API routes.
- Add auditing or logging around admin actions and account suspensions.
- Review third-party dependency versions for security advisories.
- Validate push subscription handling and use secure transport.

## 6. Notes
- The codebase is structurally secure, but security posture depends on external Supabase configuration and runtime environment controls.
- A production security review should include Supabase project settings, RLS, and network access policies.
