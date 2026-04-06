import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type DashboardPlatKey = "ig" | "fb" | "li" | "tw" | "tk" | "yt" | "th";
type DashboardPostType = "image" | "reel" | "carousel" | "story";
type DashboardStatus = "scheduled" | "draft" | "published";

type DashboardTimeSlot = {
  t: string;
  e: string;
  best: boolean;
};

type DashboardCalendarPost = {
  id: number;
  date: string;
  caption: string;
  hashtags: string[];
  plats: DashboardPlatKey[];
  type: DashboardPostType;
  timeStr: string;
  timesOptions: DashboardTimeSlot[];
  img: string;
  score: number;
  status: DashboardStatus;
  reach: number;
  engRate: string;
  isAI: boolean;
};

type StoredCalendarPayload = {
  posts: DashboardCalendarPost[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "calendar-posts.json");

const emptyPayload = (): StoredCalendarPayload => ({ posts: [] });

const ensureFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(emptyPayload(), null, 2), "utf8");
  }
};

const readPayload = async (): Promise<StoredCalendarPayload> => {
  await ensureFile();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredCalendarPayload;
    if (!Array.isArray(parsed?.posts)) return emptyPayload();
    return { posts: parsed.posts };
  } catch {
    return emptyPayload();
  }
};

const writePayload = async (payload: StoredCalendarPayload) => {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
};

export async function GET() {
  const payload = await readPayload();
  return NextResponse.json(payload, { status: 200 });
}

export async function POST(request: Request) {
  const payload = await readPayload();

  // ── Case #2: Image Upload Logic for Create New Post ──────────────────────────
  // CRITICAL: Check Content-Type to determine image source:
  // 1. If Content-Type is multipart/form-data → process local file upload
  // 2. If Content-Type is application/json → expect imageUrl field in body
  // DO NOT mix or override both sources.
  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  if (isMultipart) {
    // ── File Upload Flow ──────────────────────────────────────────────────────
    // Extract FormData: file upload with local processing
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "File is required when using multipart/form-data." },
        { status: 400 }
      );
    }

    // Parse other post fields from FormData
    const postIdStr = formData.get("id");
    if (!postIdStr) {
      return NextResponse.json({ message: "Post ID is required." }, { status: 400 });
    }

    const postId = parseInt(postIdStr as string);
    if (isNaN(postId)) {
      return NextResponse.json({ message: "Post ID must be a valid number." }, { status: 400 });
    }

    // Extract other fields from FormData if available
    const caption = formData.get("caption") as string | null;
    const status = formData.get("status") as DashboardStatus | null;

    // Create or update post with file
    // TODO: Process file upload (convert to URL/store locally)
    const updatedPost: DashboardCalendarPost = {
      id: postId,
      date: new Date().toISOString(),
      caption: caption || "",
      hashtags: [],
      plats: [] as DashboardPlatKey[],
      type: "image",
      timeStr: "12:00 PM",
      timesOptions: [],
      img: "", // TODO: Use file URL after upload processing
      score: 0,
      status: status || "draft",
      reach: 0,
      engRate: "0%",
      isAI: false,
    };

    const filtered = payload.posts.filter((item) => item.id !== postId);
    const next = [...filtered, updatedPost].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return aDate - bDate;
    });

    await writePayload({ posts: next });
    return NextResponse.json({ ok: true, message: "Post created with file upload." }, { status: 200 });
  } else {
    // ── Image URL Flow ───────────────────────────────────────────────────────
    // Parse JSON body: expect imageUrl field (string URL)
    let body: { post?: DashboardCalendarPost & { imageUrl?: string } };
    try {
      body = (await request.json()) as { post?: DashboardCalendarPost & { imageUrl?: string } };
    } catch {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }

    const post = body?.post;
    if (!post || typeof post.id !== "number") {
      return NextResponse.json({ message: "A valid post is required." }, { status: 400 });
    }

    // If imageUrl is provided, use it instead of img field
    if (post.imageUrl) {
      post.img = post.imageUrl;
      delete post.imageUrl;
    }

    const filtered = payload.posts.filter((item) => item.id !== post.id);
    const next = [...filtered, post].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return aDate - bDate;
    });

    await writePayload({ posts: next });
    return NextResponse.json({ ok: true, message: "Post created with image URL." }, { status: 200 });
  }
}

export async function DELETE(request: Request) {
  const payload = await readPayload();

  let body: { id?: number };
  try {
    body = (await request.json()) as { id?: number };
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (typeof body?.id !== "number") {
    return NextResponse.json({ message: "A valid id is required." }, { status: 400 });
  }

  const next = payload.posts.filter((item) => item.id !== body.id);
  await writePayload({ posts: next });
  return NextResponse.json({ ok: true }, { status: 200 });
}
