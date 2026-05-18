"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import supabase from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Post = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  user_id: string;
};

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function PostDetailPage({ params }: PostPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // 삭제 확인 Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // params 처리 및 데이터 로드
  useEffect(() => {
    (async () => {
      try {
        const { id } = await params;

        const { data, error: supabaseError } = await supabase
          .from("posts")
          .select("id, title, content, created_at, user_id")
          .eq("id", id)
          .single();

        if (supabaseError) {
          if (supabaseError.code === "PGRST116") {
            notFound();
          }
          setError(supabaseError.message);
        } else {
          setPost(data);
          setEditTitle(data.title);
          setEditContent(data.content || "");
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  // UI 분기: 현재 로그인 사용자가 작성자인지 확인
  // 수정/삭제 버튼은 UI 목적이며, 실제 보안은 Ch11 RLS에서 처리됩니다.
  const isAuthor = user && post && user.id === post.user_id;

  const handleEditStart = () => {
    setIsEditing(true);
    setEditTitle(post?.title || "");
    setEditContent(post?.content || "");
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleUpdate = async () => {
    if (!post) return;

    if (editTitle.trim() === "") {
      setError("제목을 입력하세요");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      // 수정: title/content를 업데이트하고 .eq("id", post.id) 조건 사용
      const { error: updateError } = await supabase
        .from("posts")
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
        })
        .eq("id", post.id);

      if (updateError) {
        setError(`수정 실패: ${updateError.message}`);
        setIsUpdating(false);
        return;
      }

      // 성공 후 post state 업데이트
      setPost({
        ...post,
        title: editTitle.trim(),
        content: editContent.trim(),
      });

      setIsEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "수정 중 오류가 발생했습니다");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    setIsDeleting(true);
    try {
      // 삭제: .eq("id", post.id) 조건으로 특정 글만 삭제
      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (deleteError) {
        setError(`삭제 실패: ${deleteError.message}`);
        setIsDeleting(false);
        return;
      }

      setDeleteDialogOpen(false);
      router.push("/posts");
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제 중 오류가 발생했습니다");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
          <p>로딩 중...</p>
        </div>
      </section>
    );
  }

  if (error && !post) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">게시글 상세</h1>
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          오류: {error}
        </p>
        <Link
          href="/posts"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          목록으로 돌아가기
        </Link>
      </section>
    );
  }

  if (!post) {
    notFound();
  }

  // 편집 모드
  if (isEditing && isAuthor) {
    return (
      <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium text-sky-600">게시글 수정</p>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="edit-title"
              className="text-sm font-medium text-slate-700"
            >
              제목
            </label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="edit-content"
              className="text-sm font-medium text-slate-700"
            >
              내용
            </label>
            <textarea
              id="edit-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
              disabled={isUpdating}
            />
          </div>

          <div className="flex gap-2 border-t border-slate-200 pt-6">
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "저장 중..." : "저장"}
            </Button>
            <Button
              variant="outline"
              onClick={handleEditCancel}
              disabled={isUpdating}
            >
              취소
            </Button>
          </div>
        </div>
      </article>
    );
  }

  // 읽기 모드
  return (
    <>
      <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium text-sky-600">게시글 상세</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {post.title}
          </h1>
          <p className="text-sm text-slate-500">
            {new Date(post.created_at).toLocaleDateString("ko-KR")}
          </p>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <p className="whitespace-pre-line leading-7 text-slate-700">
            {post.content || "(내용 없음)"}
          </p>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-200 pt-6">
          <Link
            href="/posts"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            목록으로 돌아가기
          </Link>

          {/* 
            작성자만 수정/삭제 버튼 표시 (UI 분기)
            실제 보안은 Ch11 Row Level Security(RLS)에서 처리됩니다.
          */}
          {isAuthor && (
            <>
              <Button variant="outline" onClick={handleEditStart}>
                수정
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                삭제
              </Button>
            </>
          )}
        </div>
      </article>

      {/* 삭제 확인 Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 삭제</DialogTitle>
            <DialogDescription>
              이 게시글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              (실제 삭제 권한은 Ch11 RLS에서 검증됩니다)
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
