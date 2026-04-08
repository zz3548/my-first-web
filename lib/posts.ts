export type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
};

export const posts: Post[] = [
  {
    id: 1,
    title: "React 19 새 기능 정리",
    content:
      "React 19에서 달라진 점들을 정리해봤습니다. 새로운 Hook과 성능 개선사항을 중심으로 살펴봅시다.",
    author: "김코딩",
    date: "2026-03-30",
  },
  {
    id: 2,
    title: "Tailwind CSS 4 변경사항",
    content:
      "Tailwind CSS 4의 핵심 변경사항을 소개합니다. 더 빠른 빌드와 새로운 유틸리티 클래스를 경험해보세요.",
    author: "이디자인",
    date: "2026-03-28",
  },
  {
    id: 3,
    title: "Next.js 16 App Router 가이드",
    content:
      "App Router를 사용하면 페이지 라우팅이 매우 간단해집니다. 폴더 구조가 곧 URL이 되는 마법을 체험하세요.",
    author: "박개발",
    date: "2026-03-25",
  },
];
