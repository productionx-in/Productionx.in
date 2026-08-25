import Link from "next/link";
import { supabaseServer } from "../../../lib/supabase/server";
import { createBlogDraft } from "../../actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogAdminPage() {
  const supabase = await supabaseServer();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, tags, published_at, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Blog</h1>
          <p className="admin-main__sub" style={{ marginBottom: 0 }}>
            No code needed — write, embed images or footage links, and publish straight to /blog.
          </p>
        </div>
        <form action={createBlogDraft}>
          <button className="btn">+ New post</button>
        </form>
      </div>

      {posts && posts.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/blog/${p.id}`}>{p.title}</Link>
                </td>
                <td>{(p.tags || []).join(", ") || "—"}</td>
                <td>
                  <span className={`badge badge--${p.status}`}>{p.status}</span>
                </td>
                <td>{new Date(p.updated_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">No posts yet — click &ldquo;New post&rdquo; to start writing.</div>
      )}
    </>
  );
}
