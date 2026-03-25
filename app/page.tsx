export default function Home() {
  const featuredPost = {
    title: "작은 습관이 만든 큰 변화",
    summary:
      "하루 20분의 기록이 공부와 일상에 어떤 변화를 가져왔는지 정리한 회고 글입니다.",
    category: "에세이",
    date: "2026.03.25",
    readTime: "5분 읽기",
  };

  const recentPosts = [
    {
      title: "공공인재학부에서 배운 문제 해결 방식",
      excerpt:
        "수업 프로젝트에서 사용한 분석 프레임을 실무형으로 정리해봤습니다.",
      date: "2026.03.22",
      tag: "학업",
    },
    {
      title: "집중력을 높이는 플레이리스트 구성법",
      excerpt:
        "노래를 들으며 공부할 때 방해를 줄이고 몰입을 높이는 기준을 소개합니다.",
      date: "2026.03.19",
      tag: "라이프",
    },
    {
      title: "처음 시작하는 웹 개발 학습 로드맵",
      excerpt:
        "비전공자도 따라갈 수 있도록 주차별 학습 흐름을 간단히 안내합니다.",
      date: "2026.03.14",
      tag: "개발",
    },
  ];

  const categories = ["에세이", "학업", "라이프", "개발", "리뷰"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-zinc-50 to-white px-4 py-8 font-sans text-zinc-900 sm:px-6 lg:px-8">
      <header className="mx-auto mb-8 flex w-full max-w-6xl items-center justify-between rounded-2xl border border-zinc-200 bg-white/80 px-5 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Personal Blog
          </p>
          <h1 className="text-2xl font-bold">신지원의 기록장</h1>
        </div>
        <nav className="hidden gap-6 text-sm font-medium text-zinc-600 sm:flex">
          <a href="#" className="transition hover:text-zinc-900">
            홈
          </a>
          <a href="#" className="transition hover:text-zinc-900">
            글 목록
          </a>
          <a href="#" className="transition hover:text-zinc-900">
            소개
          </a>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <article className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold text-amber-700">
              오늘의 추천 글
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight">
              {featuredPost.title}
            </h2>
            <p className="mt-4 text-zinc-600">{featuredPost.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-3 py-1">
                {featuredPost.category}
              </span>
              <span>{featuredPost.date}</span>
              <span>{featuredPost.readTime}</span>
            </div>
          </article>

          <section className="space-y-4">
            <h3 className="text-xl font-bold">최신 글</h3>
            {recentPosts.map((post) => (
              <article
                key={post.title}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">
                    {post.tag}
                  </span>
                  <span>{post.date}</span>
                </div>
                <h4 className="mt-3 text-lg font-bold">{post.title}</h4>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {post.excerpt}
                </p>
              </article>
            ))}
          </section>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">블로그 소개</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              한신대학교 공공인재학부에서 배운 것들과 일상에서 얻은 인사이트를
              기록합니다.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">카테고리</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600"
                >
                  {category}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
