import type { MetadataRoute } from "next";
import { supabaseServer } from "./lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await supabaseServer();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published");

  const blogEntries: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `https://productionx.in/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: "https://productionx.in",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://productionx.in/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogEntries,
  ];
}
