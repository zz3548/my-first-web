"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (title.trim() === "") {
      alert("제목을 입력하세요");
      return;
    }
    const newPost = {
      id: Date.now(),
      title: title.trim(),
      body: content.trim(),
      userId: 0,
    };

    try {
      localStorage.setItem("newPost", JSON.stringify(newPost));
      alert("저장되었습니다");
      router.push("/posts");
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">새 게시글 작성</h1>
        <p className="text-sm text-slate-500">
          제목과 내용을 입력한 뒤 저장 버튼을 눌러주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-slate-700">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            required
          />
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
            onChange={(event) => setContent(event.target.value)}
            placeholder="내용을 입력하세요"
            rows={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            required
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          저장
        </button>
      </form>
    </section>
  );
}
