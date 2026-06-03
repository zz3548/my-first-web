type MaybeError = unknown;

function extractMessage(err: MaybeError): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    // common Supabase error shapes
    const e = err as any;
    if (typeof e.message === "string") return e.message;
    if (typeof e.error === "string") return e.error;
    if (typeof e.description === "string") return e.description;
    if (typeof e.msg === "string") return e.msg;
    if (typeof e.code === "string") return String(e.code);
    return JSON.stringify(e);
  } catch (e) {
    return String(err);
  }
}

export function getErrorMessage(err: MaybeError): string {
  const raw = extractMessage(err).toLowerCase();

  if (!raw) return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

  // 권한 관련 (Postgres 권한 에러 코드 및 RLS 메시지)
  if (
    raw.includes("42501") ||
    raw.includes("row-level") ||
    raw.includes("row level") ||
    raw.includes("row-level security")
  ) {
    return "이 작업을 수행할 권한이 없습니다.";
  }

  // 네트워크
  if (
    raw.includes("failed to fetch") ||
    raw.includes("networkerror") ||
    raw.includes("network error")
  ) {
    return "인터넷 연결을 확인해주세요.";
  }

  // not found 계열
  if (
    raw.includes("not found") ||
    raw.includes("404") ||
    raw.includes("no rows") ||
    raw.includes("not exist")
  ) {
    return "요청한 게시글을 찾을 수 없습니다.";
  }

  // fallback
  return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export default getErrorMessage;
