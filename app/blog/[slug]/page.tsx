import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "../../lib/supabase/server";

export const revalidate = 3600;

async function getPost(slug: string) {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const title = post.seo_title || `${post.title} — ProductionX`;
  const description = post.seo_description || post.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `https://productionx.in/blog/${slug}` },
    openGraph: {
      title,
      description,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
      type: "article",
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    author: { "@type": "Organization", name: "ProductionX" },
    publisher: { "@type": "Organization", name: "ProductionX", "@id": "https://productionx.in/#studio" },
    datePublished: post.published_at,
    dateModified: post.updated_at,
    mainEntityOfPage: `https://productionx.in/blog/${slug}`,
  };

  return (
    <article className="blog-article">
      <p className="blog-article__meta">
        {post.published_at &&
          new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        {" · "}
        {post.author_name || "ProductionX"}
      </p>
      <h1>{post.title}</h1>
      {post.cover_video_url ? (
        <video className="blog-article__cover" src={post.cover_video_url} controls playsInline />
      ) : post.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="blog-article__cover" src={post.cover_image_url} alt="" />
      ) : null}
      <div className="blog-article__body" dangerouslySetInnerHTML={{ __html: post.content_html }} />
      {post.tags && post.tags.length > 0 && (
        <div className="blog-article__tags">
          {post.tags.map((t: string) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
