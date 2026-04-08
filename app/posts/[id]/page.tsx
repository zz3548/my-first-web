import Link from "next/link";
import { posts } from "@/lib/posts";

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = Number(id);
  const post = posts.find((item) => item.id === postId);

  if (!post) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">게시글 상세</h1>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          게시글을 찾을 수 없습니다
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

  return (
    <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <p className="text-sm font-medium text-sky-600">게시글 상세</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {post.title}
        </h1>
        <p className="text-sm text-slate-500">
          {post.author} · {post.date}
        </p>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <p className="whitespace-pre-line leading-7 text-slate-700">
          {post.content}
        </p>
      </div>

      <Link
        href="/posts"
        className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        목록으로 돌아가기
      </Link>
    </article>
  );
}
