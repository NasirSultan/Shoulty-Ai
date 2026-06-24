Autopost API Docs
Everything you need to connect social accounts, publish posts immediately, and schedule content across platforms — built for frontend developers.

Base URL: /api/autopost | Auth Required on all endpoints | Content-Type: application/json

What is Outstand?
Outstand is the third-party service that handles OAuth with Facebook / Instagram / LinkedIn and publishes content on your behalf. The frontend never calls Outstand directly. All communication goes through your own /api/autopost/* endpoints.

Authentication
Every endpoint requires a valid JWT in the Authorization header. The backend resolves userId from it automatically — never pass userId in the body.
Authorization: Bearer <your-jwt-token>
Content-Type:  application/json

Supported Platforms
Send platform values as lowercase strings to /connect. For /publish and /schedule the backend accepts both cases, but lowercase is recommended for consistency.

Platform | Value | OAuth Type | Publish Support
--- | --- | --- | ---
Facebook | "facebook" | Two-step OAuth | Yes
Instagram | "instagram" | Direct OAuth | Yes
LinkedIn | "linkedin" | Direct OAuth | Yes
YouTube | "youtube" | Connect only | No — connect only

YouTube Limitation: "youtube" is accepted by /connect to start the OAuth flow, but it is not supported in /publish or /schedule. The database SocialPlatform enum does not include YOUTUBE. Calling publish/schedule with "youtube" will throw a 500 error. Do not show YouTube as a posting target in your UI.

Connect Account
Initiates the OAuth connection flow for a social platform. Returns a redirect URL — send the user there to authorize.
POST /api/autopost/connect [Auth Required]

Request Body
Field | Type | Required | Description
--- | --- | --- | ---
platform | string | Required | "facebook", "instagram", "linkedin", "youtube" (connect only)

JavaScript / Fetch Example
// Step 1: Get the OAuth redirect URL
const response = await fetch('/api/autopost/connect', {
 method: 'POST',
 headers: {
   'Content-Type':  'application/json',
   'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
   platform: 'instagram'  // or 'facebook' | 'linkedin'
 })
});
const { redirectUrl } = await response.json();

// Step 2: Send user to OAuth page
window.location.href = redirectUrl;

Responses
Status | Description | Example
--- | --- | ---
200 | OK Returns OAuth redirect URL | "redirectUrl": "https://www.facebook.com/dialog/oauth?client_id=..."
400 | Invalid or unsupported platform | "message": "Failed to fetch authorization URL from Outstand"
500 | Outstand service unreachable | Callback Handling "message": "Error contacting Outstand service layer"

After the user completes OAuth, Outstand redirects them back to your frontend. You must detect the URL params and call /handle-callback to save the account.

Two Different Flows Depending on Platform:
Facebook uses a two-step session handshake (URL contains session_token).
Instagram, LinkedIn, and others use a direct connection (URL contains account_id).
Detect which flow applies by checking which param is present in the URL.

Redirect URI: https://shoutlyai.com/dashboards?status=connecting&...

Flow Steps
1. User completes OAuth on the platform
They are redirected back to your frontend at /dashboards?status=connecting with extra URL params appended by Outstand.
2. Detect the flow from URL params
Check for session_token → Facebook. Check for account_id → Instagram / LinkedIn.
3. POST to /handle-callback
Send the correct params to save the connected account to the database and mark the user's platform as active.
4. Redirect to dashboardOn success, redirect to /dashboards?status=connected and refresh the connected platforms list.

Bug Fixed in Code Below:
Outstand sends the Facebook session token as session_token (snake_case) in the redirect URL. A common mistake is using params.get('sessionToken') (camelCase) which always returns null and silently breaks the Facebook flow. The body sent to /handle-callback still uses sessionToken (camelCase) — only the URL param key is snake_case.

Callback Page — Complete Implementation
const params = new URLSearchParams(window.location.search);
if (params.get('status') === 'connecting') {
 // —— FLOW A: facebook (two-step handshake) ——
 // Outstand returns 'session_token' in snake_case
 const sessionToken = params.get('session_token');  // snake_case from URL

 // —— FLOW B: Instagram / LinkedIn (direct) ——
 const accountId = params.get('account_id');

 if (sessionToken) {
   // Facebook: send session_token value as sessionToken in body (camelCase)
   await fetch('/api/autopost/handle-callback', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
     body: JSON.stringify({ sessionToken: sessionToken })  // camelCase in body
   });
 } else if (accountId) {
   // Instagram / LinkedIn: read all params from URL
   await fetch('/api/autopost/handle-callback', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
     body: JSON.stringify({
       account_id:        params.get('account_id'),
       network_unique_id: params.get('network_unique_id'),
       username:          params.get('username'),
       network:           params.get('network') ?? 'INSTAGRAM'  // read from URL
     })
   });
 }
 // Always clean up the URL after handling
 window.location.href = '/dashboards?status=connected';
}

handle-callback — Body Params by Flow
Field | Type | Flow | Description
--- | --- | --- | ---
sessionToken | string | Facebook | Value of session_token URL param (URL is snake_case, body is camelCase)
account_id | string | Instagram/LinkedIn | The social account ID from the callback URL
network_unique_id | string | Instagram/LinkedIn | Unique identifier for the network account (from URL)
username | string | Instagram/LinkedIn | Display username from the callback URL
network | string | Instagram/LinkedIn | Read from params.get("network") — do NOT hardcode. Values: "INSTAGRAM", "LINKEDIN"

handle-callback Responses
Status | Flow | Example Response
--- | --- | ---
200 | Facebook | { "success": true, "message": "Facebook integration synchronized successfully", "accountsCount": 2, "accounts": [{ "id": "uuid", "platform": "FACEBOOK", "username": "My Page", "status": "active" }] }
200 | Instagram/LinkedIn | { "success": true, "message": "INSTAGRAM account linked successfully", "account": { "id": "uuid", "platform": "INSTAGRAM", "username": "my_handle", "status": "active" } }
400 | — | "message": "Invalid callback state parameters provided."

Publish Post
Publishes a post immediately to one or more connected platforms. The user must have already connected each target platform.
POST /api/autopost/publish [Auth Required]

Request Body
Field | Type | Required | Description
--- | --- | --- | ---
content | string | Required | The post text / caption
platforms | string[] | Required | Target platforms, e.g. ["instagram", "facebook"]. Do not include "youtube".
mediaUrls | string[] | Optional | Public CDN/S3 URLs. Videos auto-detected by .mp4 extension. Must be publicly accessible (no auth headers).

Upload Media Before Calling This Endpoint:
mediaUrls must be fully hosted, publicly accessible URLs. Upload files to your CDN or S3 bucket first, then pass the resulting URL here. Base64 strings and blob URLs are not accepted.

Text-only Post Example
const res = await fetch('/api/autopost/publish', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 body: JSON.stringify({
   content:   'Check out our latest update! ',
   platforms: ['instagram', 'facebook']
 })
});
const data = await res.json();
console.log(data.postId);  // local DB post ID for tracking

Post with Media Example
const res = await fetch('/api/autopost/publish', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 body: JSON.stringify({
   content:   'Our new product is here!',
   platforms: ['instagram'],
   mediaUrls: [
     'https://cdn.example.com/photo.jpg',   // image (any non-.mp4 extension)
     'https://cdn.example.com/promo.mp4'    // video (.mp4 extension)
   ]
 })
});

Responses
Status | Description | Example
--- | --- | ---
200 | OK | Post dispatched { "success": true, "postId": "clxyz123...", "outstandPostId": "op_abc456..." }
400 | No connected accounts for given platforms | "message": "No matching social accounts found for the given platforms"
400 | Platform rejected the content | "message": "Outstand integration rejected the content layout"
500 | Internal failure | "message": "Immediate post dispatch failed inside engine processes"

Schedule Post
Schedules one or multiple posts for future publishing. All posts share the same target platforms but each has its own content, media, and time. Posts are processed independently — if one fails the others still go through.
POST /api/autopost/schedule [Auth Required]

Request Body
Field | Type | Required | Description
--- | --- | --- | ---
platforms | string[] | Required | Shared target platforms for all posts in the batch
posts | PostItem[] | Required | Array of post objects (see below)

PostItem Object
Field | Type | Required | Description
--- | --- | --- | ---
content | string | Required | Post text / caption for this item
scheduledAt | string | Required | ISO 8601 UTC datetime, e.g. "2026-08-01T09:00:00.000Z". Must include timezone offset — never send a bare local time string.
mediaUrls | string[] | Optional | Public media URLs for this post. Same rules as /publish.

Schedule a Batch of Posts Example
const res = await fetch('/api/autopost/schedule', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 body: JSON.stringify({
   platforms: ['instagram', 'facebook'],
   posts: [
     {
       content:     'Good morning post ',
       scheduledAt: '2026-08-01T07:00:00.000Z'
     },
     {
       content:     'Afternoon update with image!',
       scheduledAt: '2026-08-01T13:00:00.000Z',
       mediaUrls:   ['https://cdn.example.com/banner.jpg']
     },
     {
       content:     'Evening video recap ',
       scheduledAt: '2026-08-01T20:00:00.000Z',
       mediaUrls:   ['https://cdn.example.com/recap.mp4']
     }
   ]
 })
});
const data = await res.json();

// Always check both arrays — partial success is possible
if (data.failed.length > 0) {
 console.warn('Some posts failed:', data.failed);
}
console.log('Scheduled:', data.scheduled);

Responses
Status | Description | Notes
--- | --- | ---
200 — All succeeded | All posts scheduled | { "success": true, "scheduled": [...], "failed": [] }
200 — Partial failure | success: false when ANY post failed | { "success": false, "scheduled": [...], "failed": ["Outstand scheduler rejected parameters"] }
400 | No connected accounts | "message": "No matching social accounts found for the given platforms"

Partial Success Handling:
Even if some posts in the batch fail, others succeed. The HTTP status is always 200. Check data.success (false = at least one failed) and display a partial-success message to the user — not a full error.

Post Status Lifecycle
The status field on a post record follows this lifecycle:
Status | Meaning
--- | ---
PROCESSING | Post was sent to Outstand — awaiting confirmation
SCHEDULED | Post is queued and will publish at scheduledAt
PUBLISHED | Successfully posted to the platform
FAILED | Post failed at Outstand or platform level

Error Reference
All errors follow a consistent shape. The message field is always human-readable and safe to show to users on 400 errors.
{
 "statusCode": 400,
 "message":    "Human readable description",
 "error":      "Bad Request"
}

Code | When It Happens | How to Handle in UI
--- | --- | ---
200 | Request succeeded | For /schedule, still check the failed[] array
400 | Missing fields, invalid platform, account not connected, token expired | Show the message field directly — it is safe and descriptive
401 | JWT missing or expired | Redirect user to login page
500 | Backend or Outstand service failure | Show a generic "Something went wrong, please try again" — do not show raw message

Frontend Implementation Checklist
Before Building the UI
JWT token is stored and injected into every request's Authorization header
The /dashboards page runs the callback URL parser on mount
File upload flow is wired to your CDN/S3 before calling /publish or /schedule

Connect Social Accounts Screen
One connect button per platform → calls POST /connect → redirects user to redirectUrl
On return to /dashboards?status=connecting → detect session_token (snake_case) or account_id
Call POST /handle-callback with the correct body shape for the detected flow
After success, refresh the user's connected platforms list
YouTube is listed as connect-only — not shown as a publish/schedule target

Publish / Schedule Screen
Only show platforms the user has already connected as selectable targets
Validate: at least one platform selected before submitting
Validate: content is not empty before submitting
For media: upload file to CDN first → get URL → include in mediaUrls[]
For schedule: datetime picker outputs UTC ISO 8601 strings with timezone offset
On /schedule response, handle partial failure — check both scheduled[] and failed[]
