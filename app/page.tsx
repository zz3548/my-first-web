type Post = {
  title: string;
  preview: string;
  author: string;
  date: string;
};

const posts: Post[] = [
  {
    title: "작은 습관이 만든 큰 변화",
    preview:
      "하루 20분의 기록이 공부와 일상에 어떤 변화를 가져왔는지 정리한 회고 글입니다.",
    author: "신지원",
    date: "2026-03-25",
  },
  {
    title: "공공인재학부에서 배운 문제 해결 방식",
    preview:
      "수업 프로젝트에서 사용한 분석 프레임을 실무형으로 정리해봤습니다.",
    author: "신지원",
    date: "2026-03-22",
  },
  {
    title: "처음 시작하는 웹 개발 학습 로드맵",
    preview:
      "비전공자도 따라갈 수 있도록 주차별 학습 흐름을 간단히 안내합니다.",
    author: "신지원",
    date: "2026-03-14",
  },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">신지원의 블로그</h1>
        <nav aria-label="메인 내비게이션" className="mt-3 flex gap-4 text-sm">
          <a href="#" className="hover:underline">
            홈
          </a>
          <a href="#" className="hover:underline">
            게시글
          </a>
          <a href="#" className="hover:underline">
            소개
          </a>
        </nav>
      </header>

      <main className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.title}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-bold">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.preview}</p>
            <p className="text-gray-600 mt-3">작성자: {post.author}</p>
            <p className="text-sm text-gray-400 mt-1">날짜: {post.date}</p>
          </article>
        ))}
      </main>

      <footer className="mt-8 text-sm text-gray-400">
        <p>© 2026 신지원의 블로그</p>
      </footer>
    </div>
  );
}
