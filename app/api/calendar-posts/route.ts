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

  let body: { post?: DashboardCalendarPost };
  try {
    body = (await request.json()) as { post?: DashboardCalendarPost };
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const post = body?.post;
  if (!post || typeof post.id !== "number") {
    return NextResponse.json({ message: "A valid post is required." }, { status: 400 });
  }

  const filtered = payload.posts.filter((item) => item.id !== post.id);
  const next = [...filtered, post].sort((a, b) => {
    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();
    return aDate - bDate;
  });

  await writePayload({ posts: next });
  return NextResponse.json({ ok: true }, { status: 200 });
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
