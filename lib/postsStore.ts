import { promises as fs } from "fs";
import path from "path";

export type Post = {
  id: number;
  title: string;
  body?: string;
  userId?: number;
};

const DATA_DIR = process.cwd();
const FILE = path.join(DATA_DIR, "data", "posts.json");

async function ensureFile() {
  try {
    await fs.access(FILE);
  } catch (e) {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, "[]", "utf8");
  }
}

export async function readPosts(): Promise<Post[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE, "utf8");
  try {
    return JSON.parse(raw) as Post[];
  } catch (e) {
    return [];
  }
}

export async function writePosts(posts: Post[]) {
  await ensureFile();
  await fs.writeFile(FILE, JSON.stringify(posts, null, 2), "utf8");
}
