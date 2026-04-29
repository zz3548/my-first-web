import { NextRequest, NextResponse } from "next/server";
import { readPosts, writePosts } from "@/lib/postsStore";

// `context.params` may be a Promise in some Next.js typings, so handle both cases.
export async function DELETE(_request: NextRequest, context: any) {
  const params = await (context.params as
    | Promise<{ id: string }>
    | { id: string });
  const id = Number((params as { id: string }).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const posts = await readPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await writePosts(filtered);
  return NextResponse.json({ ok: true });
}
