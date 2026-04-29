import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Post = {
  id: number;
  title: string;
  body?: string;
  userId?: number;
};

export default async function PostsPage() {
  // 서버에서 초기 데이터 가져오기 (간단한 예시)
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=12",
    { cache: "no-store" },
  );
  const data: Post[] = (await res.json()) || [];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">블로그</h1>
        <Button asChild>
          <Link href="/posts/new">새 글 작성</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              <CardDescription className="mt-1 text-xs">
                작성자: {post.userId ?? "익명"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {post.body}
              </p>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center justify-between">
                <Link
                  href={`/posts/${post.id}`}
                  className="text-sm text-primary underline"
                >
                  읽기
                </Link>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/posts/${post.id}`}>편집</Link>
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
