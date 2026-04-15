"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "@/app/components/SearchBar";

type Post = {
  userId?: number;
  id: number;
  title: string;
  body?: string;
};

export default function PostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filtered, setFiltered] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch posts from JSONPlaceholder
        const res = await fetch("https://jsonplaceholder.typicode.com/posts");
        const dataRaw = await res.json();
        // JSONPlaceholder posts have `title`, `body`, `userId`, `id`
        const data: Post[] = (dataRaw as any[]).map((p) => ({
          id: Number(p.id),
          title: String(p.title),
          body: String(p.body ?? ""),
          userId: p.userId ?? undefined,
        }));

        setPosts(data);
        setFiltered(data);

        const maybe = localStorage.getItem("newPost");
        if (maybe) {
          try {
            const newPost = JSON.parse(maybe) as Post;
            // Try to persist client-created post to local API, then merge
            try {
              const postRes = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: newPost.title,
                  body: newPost.body,
                  userId: newPost.userId,
                }),
              });
              if (postRes.ok) {
                const created = await postRes.json();
                setPosts((prev) => [created, ...prev]);
                setFiltered((prev) => [created, ...prev]);
              }
            } catch (e) {
              // If persisting fails, fall back to showing it in-memory
              setPosts((prev) => [newPost, ...prev]);
              setFiltered((prev) => [newPost, ...prev]);
            }

            localStorage.removeItem("newPost");
          } catch (e) {
            console.error("failed to parse newPost", e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchPosts();
  }, []);

  const handleSearch = (term: string) => {
    const t = term.trim().toLowerCase();
    if (!t) {
      setFiltered(posts);
      return;
    }
    setFiltered(
      posts.filter(
        (p) =>
          p.title.toLowerCase().includes(t) ||
          (p.body || "").toLowerCase().includes(t),
      ),
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setFiltered((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">블로그</h1>
        <Link
          href="/posts/new"
          className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          새 글 작성
        </Link>
      </div>

      <SearchBar onSearch={handleSearch} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((post) => (
          <div key={post.id} className="p-4 border rounded-lg relative">
            <Link href={`/posts/${post.id}`} className="block">
              <h2 className="font-bold text-lg">{post.title}</h2>
              <p className="text-sm text-gray-500 mt-2">
                작성자: {post.userId ?? "익명"}
              </p>
            </Link>

            <button
              onClick={() => handleDelete(post.id)}
              className="absolute top-3 right-3 text-sm text-red-600"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
