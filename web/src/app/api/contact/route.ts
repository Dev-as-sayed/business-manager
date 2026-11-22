import { NextResponse } from "next/server";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function getIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  const ip = getIp(request);
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (entry && entry.resetAt > now) {
    if (entry.count >= MAX_REQUESTS) {
      return NextResponse.json(
        {
          ok: false,
          error: "Too many requests. Please try again in a few minutes.",
        },
        { status: 429 },
      );
    }
    entry.count += 1;
  } else {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form submission." },
      { status: 400 },
    );
  }

  // Honeypot: bots that fill every field get a silent success.
  const honeypot = String(form.get("website") || "").trim();
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  // Time trap: reject submissions completed in under 2 seconds.
  const startedAt = Number(form.get("startedAt") || 0);
  if (startedAt && now - startedAt < 2000) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please take a moment to complete the form.",
      },
      { status: 400 },
    );
  }

  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const projectType = String(form.get("projectType") || "").trim();
  const message = String(form.get("message") || "").trim();

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please enter your name.";
  if (!email) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!projectType) errors.projectType = "Please choose a project type.";
  if (!message) {
    errors.message = "Please tell us about your project.";
  } else if (message.length < 10) {
    errors.message =
      "Please add a little more detail (at least 10 characters).";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please check the highlighted fields.",
        errors,
      },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const hasFile = file !== null && typeof file !== "string";

  // Stub: log non-sensitive metadata only. Replace with a CRM or email
  // integration and durable file storage before launch.
  console.info("[contact] new submission", {
    projectType,
    services: form.getAll("services").map(String),
    budget: String(form.get("budget") || ""),
    country: String(form.get("country") || ""),
    hasFile,
    messageLength: message.length,
  });

  return NextResponse.json({ ok: true });
}
