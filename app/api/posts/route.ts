import { NextResponse } from "next/server";
import { readPosts, writePosts } from "@/lib/postsStore";

export async function GET() {
  const posts = await readPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body || !body.title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const posts = await readPosts();
  const maxId = posts.length ? Math.max(...posts.map((p) => p.id)) : 0;
  const newPost = {
    id: maxId + 1,
    title: String(body.title),
    body: body.body ? String(body.body) : "",
    userId: body.userId ?? 0,
  };

  const updated = [newPost, ...posts];
  await writePosts(updated);

  return NextResponse.json(newPost, { status: 201 });
}
