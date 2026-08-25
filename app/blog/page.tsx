import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "../lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog — ProductionX",
  description:
    "Notes from a Hyderabad brand and content studio: production craft, AI tools, marketing tactics and the gear behind the work.",
  alternates: { canonical: "https://productionx.in/blog" },
};

export const revalidate = 3600;

export default async function BlogIndex() {
  const supabase = await supabaseServer();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, cover_image_url, tags, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="blog-shell">
      <div className="blog-hero">
        <p className="label label--ember">Journal</p>
        <h1>Notes from the studio.</h1>
        <p>
          Production craft, AI tools we actually use, marketing tactics that work in Hyderabad&apos;s market, and
          the gear behind the films.
        </p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="blog-grid">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-card">
              <div className="blog-card__media">
                {p.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image_url} alt="" loading="lazy" />
                ) : null}
              </div>
              <span className="blog-card__meta">
                {p.published_at ? new Date(p.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                {p.tags?.[0] ? ` · ${p.tags[0]}` : ""}
              </span>
              <h3>{p.title}</h3>
              {p.excerpt && <p>{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--ink-2)", marginTop: 40 }}>New posts are on the way.</p>
      )}
    </div>
  );
}
