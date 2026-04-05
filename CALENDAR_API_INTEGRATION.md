# Calendar API Integration Guide

This document describes the calendar APIs that have been integrated into the Shoutly AI dashboard.

## Files Created/Updated

### 1. **api/calendarApi.ts** (NEW)
Complete calendar API client with all 5 endpoints:
- `getRandomImageBySubIndustry()`
- `createMonthlyPlan()`
- `getUserPlan()`
- `updateCalendarPost()`
- `getPostDetail()`

### 2. **hooks/useCalendarApi.ts** (NEW)
React hook for easy integration in components with:
- Automatic token management
- Loading and error states
- Simplified method signatures

### 3. **api/calendarPostsApi.ts** (EXISTING)
Local API wrapper (kept for compatibility)

---

## API Endpoints

### Endpoint 1: Get Random Image by SubIndustry

**Description:** Fetches a single random image associated with a specific subIndustryId that has text=true.

**Function:**
```tsx
const image = await getRandomImageBySubIndustry(subIndustryId: string)
```

**Response:**
```json
{
  "id": "ba1e4a03-c6d5-40e9-80c4-24dc183c0437",
  "file": "https://i.ibb.co/jPXjnHfD/23fdcd81e806.png",
  "subIndustryId": "fe3e12b2-620c-47fc-81d8-297717b0d692"
}
```

**Error Responses:**
- 400: `{ statusCode: 400, message: "subIndustryId is required" }`
- 404: `{ statusCode: 404, message: "No image with text=true found" }`

**Frontend Responsibilities:**
1. Validate that subIndustryId is provided before making the request
2. Handle HTTP status codes (400, 404, 500)
3. Use the returned file URL to display the image

---

### Endpoint 2: Create Monthly Plan

**Description:** Creates a monthly content plan for the authenticated user based on a prompt, selected sub-industries, and preferred post time.

**Function:**
```tsx
const response = await createMonthlyPlan({
  prompt: string,          // Required: content idea or topic
  subIndustries: string[], // Required: array of sub-industry IDs
  postTime: string         // Required: HH:MM format (e.g., "14:30")
}, token?: string)
```

**Response:**
```json
{
  "success": true,
  "message": "Plan created successfully",
  "planType": "PAID",
  "startPlan": "2026-03-28T14:30:00.000Z",
  "totalPosts": 31,
  "posts": [
    {
      "id": "a1b2c3d4",
      "userId": "user123",
      "subIndustryId": "cb305c5e-bfb8-4c50-a3a9-f1e00d4178e1",
      "contentId": "content789",
      "reelId": "reel456",
      "imageId": "img123",
      "type": "IMAGE",
      "postTime": "2026-03-28T14:30:00.000Z",
      "status": "SCHEDULED"
    }
  ]
}
```

**Error Responses:**
- Free trial used: `{ success: false, message: "Free trial already used. Please buy a plan." }`
- No posts: `{ success: false, message: "No posts available" }`
- Creation failed: `{ success: false, message: "Plan creation failed" }`

**Validation:**
- Prompt cannot be empty
- At least one sub-industry must be selected
- Post time must match HH:MM format
- Authentication token required

**Frontend Responsibilities:**
1. Include JWT token in Authorization header
2. Validate inputs before submission
3. Show loading state while waiting
4. Display generated posts and plan type
5. Handle error messages appropriately

---

### Endpoint 3: Get User Plan

**Description:** Retrieves all scheduled posts for the authenticated user, including content, hashtags, images, and reels.

**Function:**
```tsx
const response = await getUserPlan(token?: string)
```

**Response:**
```json
{
  "success": true,
  "meta": {
    "totalPosts": 7,
    "connectedSocials": []
  },
  "posts": [
    {
      "postId": "fc8c0046-a7f8-4e35-a9e4-26841e043b2d",
      "postTime": "2026-03-27T09:30:00.000Z",
      "status": "SCHEDULED",
      "content": {
        "contentId": "534b6c1c-0b22-4d8f-ba9f-cd6e3fbfcbaa",
        "text": "Post content here",
        "hashtags": ["#FitnessJourney", "#NoExcuses"]
      },
      "media": {
        "type": "IMAGE",
        "id": "291c9fe8-1970-4ba0-a838-909c4ab45997",
        "file": "https://i.ibb.co/C575SRMd/604b44cd90d6.png"
      }
    },
    {
      "postId": "cf1857f9-bbd6-48ab-9df9-7382fef35417",
      "postTime": "2026-03-28T09:30:00.000Z",
      "status": "SCHEDULED",
      "content": {
        "contentId": "42160033-5171-404e-bee2-c27e9d68e63f",
        "text": "Strength doesn't come from comfort zones...",
        "hashtags": ["#FitnessJourney", "#NoExcuses", "#WorkoutMotivation"]
      },
      "media": {
        "type": "REEL",
        "id": "1954176f-f3c4-484a-838f-c8187318df32",
        "file": "https://shoultyai.s3.ap-south-1.amazonaws.com/reels/157899e7-5c29-4617-8048"
      }
    }
  ]
}
```

**Error Responses:**
- No plan: `{ success: false, message: "No plan found for this user" }`
- Unauthorized: `{ success: false, message: "Unauthorized: Invalid or missing token" }`

**Frontend Responsibilities:**
1. Include JWT token in Authorization header
2. Display posts sorted by postTime
3. Render media based on type (IMAGE or REEL)
4. Map hashtags with # prefix from content.hashtags
5. Show connected social accounts if available

---

### Endpoint 4: Update Calendar Post

**Description:** Updates a single calendar post. Supports updating post time, content text, reels, or images. Status cannot be updated.

**Function:**
```tsx
// JSON update
const response = await updateCalendarPost(
  postId: string,
  {
    postTime?: string,        // ISO format
    contentText?: string,     // New post content
    reelId?: string,          // Reel ID to associate
    imageUrl?: string         // Image URL (takes priority over file)
  },
  token?: string
)

// File upload
const response = await updateCalendarPost(
  postId: string,
  { postTime?, contentText?, reelId? },
  token?: string,
  file?: File  // Multipart upload
)
```

**Response:**
```json
{
  "success": true,
  "message": "Post updated",
  "post": {
    "id": "fc8c0046-a7f8-4e35-a9e4-26841e043b2d",
    "userId": "user123",
    "subIndustryId": "cb305c5e-bfb8-4c50-a3a9-f1e00d4178e1",
    "contentId": "534b6c1c-0b22-4d8f-ba9f-cd6e3fbfcbaa",
    "reelId": "1954176f-f3c4-484a-838f-c8187318df32",
    "imageId": "291c9fe8-1970-4ba0-a838-909c4ab45997",
    "imageUrl": "https://i.ibb.co/example.png",
    "type": "IMAGE",
    "postTime": "2026-03-28T14:30:00.000Z",
    "status": "SCHEDULED"
  }
}
```

**Error Responses:**
- Not found: `{ success: false, message: "Post not found or unauthorized" }`
- Update failed: `{ success: false, message: "Failed to update post" }`
- Unauthorized: `{ success: false, message: "Unauthorized: Invalid or missing token" }`

**Validation:**
- postTime must be ISO format if provided
- contentText cannot be empty if provided
- imageUrl takes priority over file upload
- Status field is ignored/rejected

**Frontend Responsibilities:**
1. Include JWT token in Authorization header
2. Validate optional fields before submission
3. Use multipart/form-data for file uploads
4. Use application/json for URL-based updates
5. Don't send status field
6. Update UI with returned post object

---

### Endpoint 5: Get Post Detail by ID

**Description:** Fetch a single calendar post by its ID. Returns full post details including media and hashtags.

**Function:**
```tsx
const response = await getPostDetail(postId: string, token?: string)
```

**Response:**
```json
{
  "success": true,
  "post": {
    "postId": "fc8c0046-a7f8-4e35-a9e4-26841e043b2d",
    "postTime": "2026-03-27T09:30:00.000Z",
    "status": "SCHEDULED",
    "content": {
      "contentId": "534b6c1c-0b22-4d8f-ba9f-cd6e3fbfcbaa",
      "text": "Post content here",
      "hashtags": ["#Hash1", "#Hash2"]
    },
    "media": {
      "type": "IMAGE",
      "id": "291c9fe8-1970-4ba0-a838-909c4ab45997",
      "file": "https://i.ibb.co/C575SRMd/604b44cd90d6.png"
    }
  }
}
```

**Error Responses:**
- Not found: `{ success: false, message: "Post not found or unauthorized" }`
- Unauthorized: `{ success: false, message: "Unauthorized: Invalid or missing token" }`

**Frontend Responsibilities:**
1. Include JWT token in Authorization header
2. Validate postId is provided and correctly formatted
3. Display post content, media, hashtags, and post time
4. Render media based on type (IMAGE or REEL)

---

## Usage Examples

### Using the Hook in a Component

```tsx
"use client";

import { useCalendarApi } from "@/hooks/useCalendarApi";
import { useEffect, useState } from "react";

export function CalendarComponent() {
  const { fetchPlan, createPlan, loading, error } = useCalendarApi();
  const [posts, setPosts] = useState([]);

  // Fetch user's plan on mount
  useEffect(() => {
    fetchPlan().then((response) => {
      if (response?.success) {
        setPosts(response.posts || []);
      }
    });
  }, [fetchPlan]);

  // Create a new plan
  const handleCreatePlan = async () => {
    const response = await createPlan({
      prompt: "Fitness motivation content for March",
      subIndustries: ["sub-industry-id-123"],
      postTime: "14:30",
    });

    if (response?.success) {
      console.log("Plan created with", response.totalPosts, "posts");
      setPosts(response.posts || []);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreatePlan}>Create Plan</button>
      {posts.map((post) => (
        <div key={post.postId}>
          <p>{post.content.text}</p>
          {post.media.type === "IMAGE" && (
            <img src={post.media.file} alt="Post" />
          )}
        </div>
      ))}
    </div>
  );
}
```

### Using the API Directly

```tsx
import {
  getUserPlan,
  createMonthlyPlan,
  updateCalendarPost,
  getPostDetail,
} from "@/api/calendarApi";

// Get all posts
const planResponse = await getUserPlan();
if (planResponse.success) {
  console.log("Total posts:", planResponse.meta.totalPosts);
}

// Create a plan
const createResponse = await createMonthlyPlan({
  prompt: "Summer collection launch",
  subIndustries: ["fashion-sub-id"],
  postTime: "10:00",
});

// Update a post
const updateResponse = await updateCalendarPost("post-id-123", {
  contentText: "Updated caption",
  postTime: "2026-04-01T14:30:00.000Z",
});

// Get specific post
const detailResponse = await getPostDetail("post-id-123");
```

---

## Integration Checklist

- [ ] Import APIs from `api/calendarApi.ts` or use `useCalendarApi` hook
- [ ] Ensure authentication token is stored in `localStorage.getItem("shoutly_token")`
- [ ] Add loading and error state handling
- [ ] Validate inputs before API calls
- [ ] Display images based on media type (IMAGE vs REEL)
- [ ] Render hashtags with # prefix
- [ ] Show appropriate success/error messages to users
- [ ] Handle token expiration and re-authentication
- [ ] Test all CRUD operations (Create, Read, Update, Delete via plans)

---

## Error Handling Best Practices

```tsx
import { useCalendarApi } from "@/hooks/useCalendarApi";

function MyComponent() {
  const { fetchPlan, error, loading, clearError } = useCalendarApi();

  useEffect(() => {
    const loadPlan = async () => {
      const response = await fetchPlan();

      if (!response?.success) {
        // Handle API error
        console.error("Failed to load plan:", response?.message);
      }
    };

    loadPlan();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <ErrorAlert
        message={error}
        onDismiss={() => clearError()}
        onRetry={() => fetchPlan()}
      />
    );
  }

  return <YourContent />;
}
```

---

## Authentication & Token Management

All API functions automatically retrieve the token from `localStorage.getItem("shoutly_token")` on the client side. However, you can also pass a token explicitly:

```tsx
const token = localStorage.getItem("shoutly_token");
const response = await getUserPlan(token);
```

The Authorization header is set automatically as:
```
Authorization: Bearer <JWT Token>
```

---

## Base URL

Production: `https://ai-shoutly-backend.onrender.com`

Override via environment variable:
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

---

## Summary

You now have:
1. ✅ Full type-safe API client (`api/calendarApi.ts`)
2. ✅ React hook for component integration (`hooks/useCalendarApi.ts`)
3. ✅ All 5 endpoints implemented with proper error handling
4. ✅ Automatic token management
5. ✅ Comprehensive documentation

Next steps:
1. Integrate into your calendar dashboard page
2. Add compose workflow for creating plans
3. Implement post editing modal
4. Add real-time updates
