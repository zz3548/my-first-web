import PostsClient from "./PostsClient";

export default function PostsPage() {
  return (
    <div>
      {/* PostsClient handles fetching, searching, 삭제 등의 클라이언트 로직 */}
      <PostsClient />
    </div>
  );
}
