import React from "react";
import Link from "next/link";

type Props = {
  post: any;
};

export default function PostCard({ post }: Props) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-44 object-cover rounded-md mb-3"
        />
      )}
      <h3 className="text-lg font-semibold text-slate-900">
        <Link href={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <p className="text-sm text-slate-600 mt-2 line-clamp-3">
        {post.content || "(내용 없음)"}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <div>{new Date(post.created_at).toLocaleDateString()}</div>
        <div>{/* placeholder for likes/comments */}</div>
      </div>
    </article>
  );
}
