"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "@/app/components/SearchBar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Post = {
  userId?: number;
  id: number;
  title: string;
  body?: string;
};

export default function PostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filtered, setFiltered] = useState<Post[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts");
        const dataRaw = await res.json();
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
              } else {
                setPosts((prev) => [newPost, ...prev]);
                setFiltered((prev) => [newPost, ...prev]);
              }
            } catch (e) {
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

  const confirmDelete = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setFiltered((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
    setDialogOpen(false);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">블로그</h1>
        <Button asChild>
          <Link href="/posts/new">새 글 작성</Link>
        </Button>
      </div>

      <SearchBar onSearch={handleSearch} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((post) => (
          <Card key={post.id} className="relative">
            <CardHeader>
              <div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="mt-1 text-xs">
                  작성자: {post.userId ?? "익명"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {post.body}
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-sm text-primary underline"
                  >
                    읽기
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/posts/${post.id}`}>편집</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteTarget(post);
                      setDialogOpen(true);
                    }}
                    aria-label={`삭제 ${post.title}`}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 삭제 확인 다이얼로그 (단일 인스턴스) */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
          </DialogHeader>
          <DialogDescription className="mt-2">
            {deleteTarget
              ? `${deleteTarget.title} 를 삭제하면 복구할 수 없습니다.`
              : "삭제 항목을 확인하세요."}
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) confirmDelete(deleteTarget.id);
              }}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
