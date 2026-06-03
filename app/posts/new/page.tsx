"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import supabase from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  // 미인증 사용자 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setTitleError(null);
    setContentError(null);

    if (!user) {
      setError("로그인이 필요합니다");
      return;
    }

    // 클라이언트 유효성 검사
    let valid = true;
    if (title.trim().length < 2) {
      setTitleError("제목은 최소 2자 이상이어야 합니다.");
      valid = false;
    }
    if (content.trim().length < 10) {
      setContentError("내용은 최소 10자 이상이어야 합니다.");
      valid = false;
    }
    if (!valid) return;

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        setUploadingImage(true);
        const rawName = imageFile.name || "file";
        const extMatch = rawName.match(/(\.[a-zA-Z0-9_-]+)$/);
        const ext = extMatch ? extMatch[1] : "";
        const uid =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}`;
        const filePath = `${user.id}/${Date.now()}-${uid}${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, imageFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("Image upload failed:", uploadError);
          setError("이미지 업로드에 실패했습니다. 다시 시도해 주세요.");
          setIsSubmitting(false);
          setUploadingImage(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        imageUrl = publicData?.publicUrl ?? null;
        setUploadingImage(false);
      }

      // Try client insert first (uses browser session so RLS can pass)
      console.log("[NewPost] user.id:", user.id);
      try {
        const userCheck = await supabase.auth.getUser();
        console.log("[NewPost] supabase.auth.getUser():", userCheck);
      } catch (e) {
        console.warn("[NewPost] supabase.auth.getUser() failed:", e);
      }

      const { data: inserted, error: insertErr } = await supabase
        .from("posts")
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            image_url: imageUrl,
            user_id: user.id,
          },
        ])
        .select("id")
        .single();

      if (!insertErr && inserted?.id) {
        router.push(`/posts/${inserted.id}`);
        return;
      }

      console.warn(
        "Client insert error, falling back to /api/posts:",
        insertErr,
      );

      // Fallback to server API
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl,
        }),
      });

      if (!res.ok) {
        let resultErr = null;
        try {
          resultErr = await res.json();
        } catch (e) {
          // nothing
        }
        console.error(
          "Failed to create post (server error):",
          resultErr || res.statusText || res,
        );
        setError("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      if (data?.id) {
        router.push(`/posts/${data.id}`);
      } else {
        router.push("/posts");
      }
    } catch (e) {
      console.error("Failed to create post (exception):", e);
      setError("저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
          <p>로딩 중...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <p>로그인이 필요합니다. 로그인 페이지로 이동 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">새 게시글 작성</h1>
        <p className="text-sm text-slate-500">
          제목과 내용을 입력한 뒤 저장 버튼을 눌러주세요.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            제목
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (titleError) setTitleError(null);
              if (error) setError(null);
            }}
            placeholder="제목을 입력하세요"
            required
            aria-invalid={!!titleError}
            disabled={isSubmitting}
          />
          {titleError && (
            <p className="mt-1 text-sm text-red-700">{titleError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="content"
            className="text-sm font-medium text-slate-700"
          >
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              if (contentError) setContentError(null);
              if (error) setError(null);
            }}
            placeholder="내용을 입력하세요"
            rows={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-500"
            required
            aria-invalid={!!contentError}
            disabled={isSubmitting}
          />
          {contentError && (
            <p className="mt-1 text-sm text-red-700">{contentError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="image" className="sr-only">
            이미지 (선택)
          </label>

          <div className="flex items-center gap-3">
            <input
              id="image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setImageFile(f);
                if (error) setError(null);
                if (f) {
                  try {
                    const url = URL.createObjectURL(f);
                    setImagePreview(url);
                  } catch (e) {
                    setImagePreview(null);
                  }
                } else {
                  setImagePreview(null);
                }
              }}
              disabled={isSubmitting || uploadingImage}
            />

            <Button
              type="button"
              onClick={() => {
                const el = document.getElementById(
                  "image",
                ) as HTMLInputElement | null;
                el?.click();
              }}
              disabled={isSubmitting || uploadingImage}
            >
              {imageFile ? "파일 변경" : "이미지 선택"}
            </Button>

            <div className="text-sm text-slate-600">
              {uploadingImage
                ? "업로드 중..."
                : imageFile
                  ? imageFile.name
                  : "선택된 파일 없음"}
            </div>
          </div>
        </div>

        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm text-slate-500 mb-2">
              선택한 이미지 미리보기
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="선택한 이미지 미리보기"
              className="max-h-48 w-auto rounded-md object-cover"
            />
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </form>
    </section>
  );
}
