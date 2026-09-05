import { resetE2EBookmarks } from "@/lib/e2e/bookmarks-store";
import { isBrowserE2EMode } from "@/lib/e2e/mode";

export async function POST() {
  if (!isBrowserE2EMode()) {
    return new Response(null, { status: 404 });
  }

  resetE2EBookmarks();
  return Response.json({ status: "ok" });
}
