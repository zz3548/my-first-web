import { NextResponse } from "next/server";
import { readPosts, writePosts } from "@/lib/postsStore";

type Params = {
  params: {
    id: string;
  };
};

export async function DELETE(_request: Request, { params }: Params) {
  const id = Number(params.id);
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
