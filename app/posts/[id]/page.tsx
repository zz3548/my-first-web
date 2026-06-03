"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
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
  image_url?: string | null;
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
  const [comments, setComments] = useState<any[] | null>(null);
  const [newComment, setNewComment] = useState("");

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 삭제 확인 Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 댓글 편집/삭제 상태
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isCommentUpdating, setIsCommentUpdating] = useState(false);
  const [isCommentDeleting, setIsCommentDeleting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [postLiked, setPostLiked] = useState(false);
  const [postLikeCount, setPostLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // params 처리 및 데이터 로드
  useEffect(() => {
    (async () => {
      try {
        const { id } = await params;

        // If id looks like a numeric local post id, fetch from our server API.
        if (/^\d+$/.test(id)) {
          const res = await fetch(`/api/local-posts/${id}`);
          if (res.status === 404) {
            setError("게시글을 찾을 수 없습니다.");
            return;
          }
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(
              body.message || "로컬 포스트를 불러오는 중 오류가 발생했습니다.",
            );
            return;
          }
          const mapped = (await res.json()) as Post;
          setPost(mapped);
          setEditTitle(mapped.title);
          setEditContent(mapped.content || "");
          return;
        }

        // If id is not numeric, treat as UUID and query Supabase. Validate simple UUID shape first.
        const isUuid =
          /^[0-9a-fA-F-]{36}$/.test(id) ||
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            id,
          );
        if (!isUuid) {
          // avoid sending invalid uuid to Supabase which causes DB error
          setError("잘못된 게시물 ID 형식입니다.");
          return;
        }

        let data: any = null;
        let supabaseError: any = null;
        try {
          const res = await supabase
            .from("posts")
            .select("id, title, content, image_url, created_at, user_id")
            .eq("id", id)
            .single();
          data = res.data;
          supabaseError = res.error;
        } catch (err: any) {
          // retry without image_url if column not present
          try {
            const res2 = await supabase
              .from("posts")
              .select("id, title, content, created_at, user_id")
              .eq("id", id)
              .single();
            data = res2.data;
            supabaseError = res2.error;
          } catch (err2) {
            supabaseError = err2;
          }
        }

        if (supabaseError) {
          if (supabaseError.code === "PGRST116") {
            setError("게시글을 찾을 수 없습니다.");
            return;
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
        // 로딩이 끝난 뒤 댓글과 좋아요 상태를 refreshComments()로 처리
        try {
          await refreshComments();
        } catch (e) {
          setComments([]);
        }
      }
    })();
  }, [params]);

  // UI 분기: 현재 로그인 사용자가 작성자인지 확인
  // 수정/삭제 버튼은 UI 목적이며, 실제 보안은 Ch11 RLS에서 처리됩니다.
  const isAuthor = user && post && user.id === post.user_id;

  const estimateReadTime = (text?: string | null) => {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // helper: fetch comments + per-comment like info + post like summary
  const refreshComments = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/posts/${id}/comments`, {
        credentials: "same-origin",
      });
      const cs = await res.json().catch(() => []);
      const list = Array.isArray(cs) ? cs : [];

      // fetch post like summary
      try {
        const likesRes = await fetch(`/api/posts/${id}/likes`, {
          credentials: "same-origin",
        });
        const likesJson = await likesRes.json().catch(() => ({}));
        setPostLiked(Boolean(likesJson.liked));
        setPostLikeCount(Number(likesJson.count) || 0);
      } catch (e) {
        // ignore
      }

      // fetch comment like states in parallel
      try {
        const commentLikePromises = list.map((c: any) =>
          fetch(`/api/posts/${id}/comments/${c.id}/like`, {
            credentials: "same-origin",
          })
            .then((r) => r.json())
            .catch(() => ({ liked: false, count: 0 })),
        );
        const likeResults = await Promise.all(commentLikePromises);
        const merged = list.map((c: any, idx: number) => ({
          ...c,
          like_count: likeResults[idx]?.count || 0,
          liked: !!likeResults[idx]?.liked,
        }));
        setComments(merged);
      } catch (e) {
        setComments(list);
      }
    } catch (e) {
      setComments([]);
    }
  };

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
      let imageUrlToSave: string | null = post.image_url ?? null;

      if (imageFile) {
        setUploadingImage(true);
        // Build safe key: uuid + original ext
        const rawName = imageFile.name || "file";
        const extMatch = rawName.match(/(\.[a-zA-Z0-9_-]+)$/);
        const ext = extMatch ? extMatch[1] : "";
        const uid =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}`;
        const filePath = `${post.user_id}/${Date.now()}-${uid}${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, imageFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          setError("이미지 업로드에 실패했습니다.");
          setUploadingImage(false);
          setIsUpdating(false);
          console.error("[EditPost] storage upload error:", uploadError);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        imageUrlToSave = publicData?.publicUrl ?? null;
        setUploadingImage(false);
      }

      try {
        const userCheck = await supabase.auth.getUser();
        console.log("[EditPost] supabase.auth.getUser():", userCheck);
      } catch (e) {
        console.warn("[EditPost] supabase.auth.getUser() failed:", e);
      }

      const { error: updateError } = await supabase
        .from("posts")
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
          image_url: imageUrlToSave,
        })
        .eq("id", post.id);

      if (updateError) {
        setError(`수정 실패: ${updateError.message}`);
        setIsUpdating(false);
        console.error("[EditPost] update error:", updateError);
        return;
      }

      // 성공 후 post state 업데이트
      setPost({
        ...post,
        title: editTitle.trim(),
        content: editContent.trim(),
        image_url: imageUrlToSave,
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

          <div className="space-y-2">
            <label htmlFor="edit-image" className="sr-only">
              이미지 (선택)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="edit-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setImageFile(f);
                  if (error) setError(null);
                }}
                disabled={isUpdating || uploadingImage}
              />
              <Button
                type="button"
                onClick={() => {
                  const el = document.getElementById(
                    "edit-image",
                  ) as HTMLInputElement | null;
                  el?.click();
                }}
                disabled={isUpdating || uploadingImage}
              >
                {imageFile ? "파일 변경" : "이미지 업로드"}
              </Button>
              <div className="text-sm text-slate-600">
                {uploadingImage
                  ? "업로드 중..."
                  : imageFile
                    ? imageFile.name
                    : post?.image_url
                      ? "현재 이미지 있음"
                      : "선택된 파일 없음"}
              </div>
            </div>
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

  // 읽기 모드 — 깔끔 리더 스타일
  return (
    <>
      <article className="max-w-3xl mx-auto rounded-2xl bg-white p-8 shadow-sm">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-medium">
                {post.user_id
                  ? post.user_id.toString().slice(0, 1).toUpperCase()
                  : "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {post.user_id}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(post.created_at).toLocaleDateString("ko-KR")} ·{" "}
                  {estimateReadTime(post.content)}분 읽기
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 mr-2">
                  오류: {error}
                </div>
              )}
              <Button
                variant={postLiked ? undefined : "outline"}
                onClick={async () => {
                  try {
                    const { id } = await params;
                    const res = await fetch(`/api/posts/${id}/likes`, {
                      method: "POST",
                      credentials: "same-origin",
                    });
                    if (!res.ok) {
                      const body = await res.json().catch(() => ({}));
                      setError(body.error || "좋아요 실패");
                      return;
                    }
                    const json = await res.json();
                    setPostLiked(Boolean(json.liked));
                    setPostLikeCount(Number(json.count) || 0);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : String(e));
                  }
                }}
              >
                {postLiked ? `♥ ${postLikeCount}` : `♡ ${postLikeCount}`}
              </Button>

              <Button
                variant={bookmarked ? undefined : "outline"}
                onClick={() => setBookmarked((s) => !s)}
              >
                {bookmarked ? "북마크됨" : "북마크"}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const url =
                    typeof window !== "undefined" ? window.location.href : "";
                  if (navigator.share) {
                    navigator.share({ title: post.title, url }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(url).catch(() => {});
                    alert("링크가 복사되었습니다");
                  }
                }}
              >
                공유
              </Button>
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900">
            {post.title}
          </h1>
          {post.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_url}
              alt={post.title}
              className="mt-6 w-full rounded-lg object-cover"
            />
          )}
        </header>

        <section className="prose max-w-none text-lg leading-8 text-slate-700">
          <p className="whitespace-pre-line">{post.content || "(내용 없음)"}</p>
        </section>

        <div className="mt-8 flex justify-between">
          <Link
            href="/posts"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            목록으로 돌아가기
          </Link>

          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEditStart}>
                수정
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                삭제
              </Button>
            </div>
          )}
        </div>
      </article>

      {/* 댓글 섹션 */}
      <section className="mt-6">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">댓글</h3>
        </div>

        <div className="mt-4 space-y-4">
          {user ? (
            <div className="space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                id="new-comment"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <div className="flex justify-end">
                <Button
                  onClick={async () => {
                    const content = newComment?.trim();
                    if (!content) {
                      setError("댓글을 입력하세요");
                      return;
                    }

                    try {
                      const { id } = await params;
                      const res = await fetch(`/api/posts/${id}/comments`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content }),
                      });

                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        setError(body.error || "댓글 작성에 실패했습니다");
                        return;
                      }

                      await res.json();
                      // 새 댓글을 바로 불러오기 대신 간단히 리스트 재로딩
                      const { id: postId } = await params;
                      await refreshComments();
                      setNewComment("");
                    } catch (e) {
                      setError(e instanceof Error ? e.message : String(e));
                    }
                  }}
                >
                  등록
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
              <p>
                댓글을 작성하려면{" "}
                <Link href="/login" className="text-sky-600">
                  로그인
                </Link>{" "}
                하세요.
              </p>
            </div>
          )}

          {/* 댓글 목록 (간단한 로딩/에러 처리) */}
          <div className="space-y-3">
            {comments && comments.length === 0 && (
              <p className="text-sm text-slate-500">아직 댓글이 없습니다.</p>
            )}

            {comments &&
              comments.map((c: any) => (
                <div
                  key={c.id}
                  className="flex gap-3 rounded-lg border bg-white p-3 hover:bg-slate-50 transition"
                >
                  <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-sm text-slate-700">
                    {c.profiles?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.profiles.avatar_url}
                        alt={c.profiles?.username || "avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-medium">
                        {c.profiles?.username
                          ? String(c.profiles.username)
                              .slice(0, 1)
                              .toUpperCase()
                          : c.user_id
                            ? String(c.user_id).slice(0, 1).toUpperCase()
                            : "U"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    {/* header */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-900">
                        {c.profiles?.username || c.user_id}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(c.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* body */}
                    {editingCommentId === c.id ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          value={editingCommentContent}
                          onChange={(e) =>
                            setEditingCommentContent(e.target.value)
                          }
                          rows={4}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={async () => {
                              const content = editingCommentContent?.trim();
                              if (!content) {
                                setError("댓글 내용을 입력하세요");
                                return;
                              }
                              setIsCommentUpdating(true);
                              try {
                                const { id: postId } = await params;
                                const res = await fetch(
                                  `/api/posts/${postId}/comments/${c.id}`,
                                  {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ content }),
                                  },
                                );
                                if (!res.ok) {
                                  const body = await res
                                    .json()
                                    .catch(() => ({}));
                                  setError(body.error || "댓글 수정 실패");
                                  setIsCommentUpdating(false);
                                  return;
                                }
                                // 재로딩
                                await refreshComments();
                                setEditingCommentId(null);
                                setEditingCommentContent("");
                              } catch (e) {
                                setError(
                                  e instanceof Error ? e.message : String(e),
                                );
                              } finally {
                                setIsCommentUpdating(false);
                              }
                            }}
                            disabled={isCommentUpdating}
                          >
                            저장
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingCommentContent("");
                            }}
                            disabled={isCommentUpdating}
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-700 mt-2">
                          {c.content}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-slate-400">
                            {/* show username and timestamp compact */}
                            {c.profiles?.username || c.user_id} ·{" "}
                            {new Date(c.created_at).toLocaleString()}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              className="text-sm text-slate-600 hover:text-slate-800"
                              onClick={async () => {
                                try {
                                  const { id: postId } = await params;
                                  const res = await fetch(
                                    `/api/posts/${postId}/comments/${c.id}/like`,
                                    {
                                      method: "POST",
                                      credentials: "same-origin",
                                    },
                                  );
                                  if (!res.ok) {
                                    const body = await res
                                      .json()
                                      .catch(() => ({}));
                                    setError(body.error || "좋아요 실패");
                                    return;
                                  }
                                  await refreshComments();
                                } catch (e) {
                                  setError(
                                    e instanceof Error ? e.message : String(e),
                                  );
                                }
                              }}
                            >
                              {c.liked
                                ? `♥ ${c.like_count || 0}`
                                : `♡ ${c.like_count || 0}`}
                            </button>

                            {user && user.id === c.user_id && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCommentId(c.id);
                                    setEditingCommentContent(c.content || "");
                                  }}
                                >
                                  수정
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={async () => {
                                    if (!confirm("이 댓글을 삭제하시겠습니까?"))
                                      return;
                                    setIsCommentDeleting(true);
                                    try {
                                      const { id: postId } = await params;
                                      const res = await fetch(
                                        `/api/posts/${postId}/comments/${c.id}`,
                                        {
                                          method: "DELETE",
                                          credentials: "same-origin",
                                        },
                                      );
                                      if (!res.ok) {
                                        const body = await res
                                          .json()
                                          .catch(() => ({}));
                                        setError(body.error || "삭제 실패");
                                        setIsCommentDeleting(false);
                                        return;
                                      }
                                      await refreshComments();
                                    } catch (e) {
                                      setError(
                                        e instanceof Error
                                          ? e.message
                                          : String(e),
                                      );
                                    } finally {
                                      setIsCommentDeleting(false);
                                    }
                                  }}
                                >
                                  삭제
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

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
