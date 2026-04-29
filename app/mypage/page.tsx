import Link from "next/link";

export default function MyPage() {
  // TODO: 실제 인증 연동 후 서버에서 프로필 정보를 렌더링하도록 변경
  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">마이페이지</h1>
      <p className="text-sm text-slate-600">
        로그인한 사용자의 개인 공간입니다.
      </p>

      <div className="mt-4 space-y-3 rounded-lg border border-slate-200 p-4">
        <p>
          현재는 모의 상태입니다. 로그인 후 프로필과 작성한 글을 확인하세요.
        </p>
        <div className="flex gap-2">
          <Link href="/login" className="text-sm text-sky-600 underline">
            로그인
          </Link>
          <Link href="/posts" className="text-sm text-sky-600 underline">
            포스트 목록
          </Link>
        </div>
      </div>
    </section>
  );
}
